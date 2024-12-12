import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  Platform,
} from "react-native";
import { ActivityIndicator, Button, Snackbar, Card } from "react-native-paper";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useAuth } from "../context/AuthContext";
import * as Location from "expo-location";
import {
  createRide,
  updateRide,
  getRides,
  getRideById,
  RideResponseDto,
} from "../api/RideService";
import { useQuery } from "react-query";
import { getRiderById } from "../api/RiderService";
import { getDriverById } from "../api/DriverService";
import commonStyles from "../styles/commonStyles";

const { width, height } = Dimensions.get("window");
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw", // Replace with your actual API key
  });

  const { userId, role, accessToken } = useAuth();

  if (!userId) {
    return <Text>Please log in to view this page.</Text>;
  }

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startCoords, setStartCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [driverCoords, setDriverCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("");
  const [rideCreated, setRideCreated] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [requestedRides, setRequestedRides] = useState<RideResponseDto[]>([]);
  const [acceptedRide, setAcceptedRide] = useState<RideResponseDto | null>(
    null
  ); // For driver
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [estimatedDistance, setEstimatedDistance] = useState<string>("");

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch,
  } = useQuery(
    ["userProfile", role, userId],
    () =>
      role === "rider" && userId
        ? getRiderById(userId).then((res) => res.data)
        : role === "driver" && userId
        ? getDriverById(userId).then((res) => res.data)
        : Promise.reject("Invalid user or role"),
    {
      enabled: !!userId && !!role && !!accessToken,
      onError: () => setSnackbarVisible(true),
    }
  );

  // Fetch user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission status:", status);
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log("Current location:", currentLocation);
      setLocation(currentLocation?.coords);
    })();
  }, []);

  // Fetch requested rides for drivers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (role === "driver" && !acceptedRide) {
      const fetchRides = () => {
        setLoading(true);
        getRides()
          .then((response) => {
            const rides = response.data.filter(
              (ride) => ride.status === "Requested"
            );
            setRequestedRides(rides);
          })
          .catch((error) => {
            setLocationError("Error fetching requested rides");
          })
          .finally(() => setLoading(false));
      };
      fetchRides();
      interval = setInterval(fetchRides, 5000); // Poll every 5 seconds
      console.log("Polling requested rides every 5 seconds.");
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("Stopped polling requested rides.");
      }
    };
  }, [role, userId, acceptedRide]);

  // Polling to check ride status (rider side)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (role === "rider" && rideCreated && rideId) {
      interval = setInterval(() => {
        getRideById(rideId)
          .then((response) => {
            const ride = response.data;
            setRideStatus(ride.status);
            console.log("Fetched ride status:", ride.status);

            if (ride.status === "Dispatched" && ride.driver.id) {
              setDriverCoords({
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0,
              });
              calculateDistanceAndTime(
                driverCoords,
                startCoords,
                setEstimatedTime,
                setEstimatedDistance
              );
            }

            if (ride.status === "Cancelled") {
              setRideCreated(false);
              setRideId(null);
              setStartCoords(null);
              setEndCoords(null);
              setDriverCoords(null);
              setSnackbarVisible(true);
              console.log("Ride has been cancelled.");
            }

            if (ride.status === "In Transit") {
              setSnackbarVisible(true);
              console.log("Ride is now in transit.");
            }
          })
          .catch((error) => {
            console.error("Failed to fetch ride status:", error);
          });
      }, 5000);
      console.log("Polling ride status every 5 seconds.");
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("Stopped polling ride status.");
      }
    };
  }, [role, rideCreated, rideId, driverCoords, startCoords, location]);

  // Google Distance Matrix API with CORS Proxy
  const calculateDistanceAndTime = async (
    origin: { latitude: number; longitude: number } | null,
    destination: { latitude: number; longitude: number } | null,
    setTime: React.Dispatch<React.SetStateAction<string>>,
    setDistance: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!origin || !destination) return;

    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    try {
      const response = await fetch(
        `${CORS_PROXY}https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&key=AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw` // Replace with your actual API key
      );
      const data = await response.json();
      console.log("Distance Matrix Response:", data);

      if (data.status === "OK") {
        const element = data.rows[0].elements[0];
        if (element.status === "OK") {
          console.log("Duration:", element.duration.text);
          console.log("Distance:", element.distance.text);
          setTime(element.duration.text);
          setDistance(element.distance.text);
        } else {
          console.error("Distance Matrix element error:", element.status);
        }
      } else {
        console.error("Distance Matrix API error:", data.status);
      }
    } catch (error) {
      console.error("Error fetching distance matrix:", error);
    }
  };

  // Geocode address to coordinates with CORS Proxy
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `${CORS_PROXY}https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw` // Replace with your actual API key
      );
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.error("Geocoding error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleRequestRide = async () => {
    if (!startLocation || !endLocation) {
      setLocationError("Please select both start and end locations.");
      return;
    }

    setLoading(true);
    try {
      const startCoordsResult = await geocodeAddress(startLocation);
      const endCoordsResult = await geocodeAddress(endLocation);

      if (!startCoordsResult || !endCoordsResult) {
        setLocationError("Failed to geocode addresses. Please try again.");
        setLoading(false);
        return;
      }

      setStartCoords({
        latitude: startCoordsResult.lat,
        longitude: startCoordsResult.lng,
      });
      setEndCoords({
        latitude: endCoordsResult.lat,
        longitude: endCoordsResult.lng,
      });

      const response = await createRide({
        riderId: userId,
        startLocation,
        endLocation,
      });
      const newRide = response.data;
      setRideId(newRide.id);

      setLocationError(null);
      setSnackbarVisible(true);
      setRideCreated(true);
      setRideStatus("Ride Requested");
      console.log("Ride requested successfully.");
    } catch (error) {
      console.error(error);
      setLocationError("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setLoading(true);
    try {
      await updateRide(rideId, {
        status: "Dispatched",
        driverId: userId,
      });
      setRequestedRides((prevRides) =>
        prevRides.filter((ride) => ride.id !== rideId)
      );

      const acceptedRideData = await getRideById(rideId).then(
        (res) => res.data
      );
      setAcceptedRide(acceptedRideData || null);

      if (acceptedRideData) {
        const riderStartCoords = await geocodeAddress(
          acceptedRideData.startLocation
        );
        const riderEndCoords = await geocodeAddress(
          acceptedRideData.endLocation
        );
        setStartCoords({
          latitude: riderStartCoords!.lat,
          longitude: riderStartCoords!.lng,
        });
        setEndCoords({
          latitude: riderEndCoords!.lat,
          longitude: riderEndCoords!.lng,
        });
        setRideCreated(true);
        setRideStatus("Ride Accepted");
        setDriverCoords(location);

        // Calculate ETA and distance
        calculateDistanceAndTime(
          { latitude: location!.latitude, longitude: location!.longitude },
          { latitude: riderStartCoords!.lat, longitude: riderStartCoords!.lng },
          setEstimatedTime,
          setEstimatedDistance
        );
      }
      setSnackbarVisible(true);
      console.log("Ride accepted successfully.");
    } catch (error) {
      console.error(error);
      setLocationError("Failed to accept ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate distance using Haversine formula
  const getDistance = (
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to simulate driver movement
  const moveDriverTowardsRider = () => {
    if (!driverCoords || !startCoords) return;

    const step = 0.001; // Adjust for desired speed

    let newLatitude = driverCoords.latitude;
    let newLongitude = driverCoords.longitude;

    if (Math.abs(driverCoords.latitude - startCoords.latitude) > step) {
      newLatitude +=
        driverCoords.latitude < startCoords.latitude ? step : -step;
    }

    if (Math.abs(driverCoords.longitude - startCoords.longitude) > step) {
      newLongitude +=
        driverCoords.longitude < startCoords.longitude ? step : -step;
    }

    setDriverCoords({
      latitude: newLatitude,
      longitude: newLongitude,
    });

    // Recalculate ETA and distance
    calculateDistanceAndTime(
      { latitude: newLatitude, longitude: newLongitude },
      { latitude: startCoords.latitude, longitude: startCoords.longitude },
      setEstimatedTime,
      setEstimatedDistance
    );

    // Check if driver has arrived near the rider
    const distance = getDistance(
      { latitude: newLatitude, longitude: newLongitude },
      { latitude: startCoords.latitude, longitude: startCoords.longitude }
    );
    console.log("Driver Distance to Rider:", distance);

    if (distance < 0.05) {
      // Approximately 50 meters
      setRideStatus("Passenger Picked Up");
      if (driverMovementInterval.current) {
        clearInterval(driverMovementInterval.current);
        driverMovementInterval.current = null;
      }
      console.log("Driver has arrived near the rider.");
    }
  };

  const driverMovementInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (role === "driver" && acceptedRide && rideStatus === "Ride Accepted") {
      if (!driverMovementInterval.current) {
        driverMovementInterval.current = setInterval(
          moveDriverTowardsRider,
          5000 // Move every 5 seconds
        );
        console.log("Driver movement simulation started.");
      }
    }
    return () => {
      if (driverMovementInterval.current) {
        clearInterval(driverMovementInterval.current);
        driverMovementInterval.current = null;
        console.log("Driver movement simulation stopped.");
      }
    };
  }, [role, acceptedRide, rideStatus, driverCoords, startCoords]);

  // Handle passenger picked up
  const handlePassengerPickedUp = async () => {
    if (!acceptedRide) return;
    setLoading(true);
    try {
      await updateRide(acceptedRide.id, {
        status: "In Transit",
        driverId: userId,
      });
      setRideStatus("In Transit");
      setSnackbarVisible(true);
      console.log("Passenger marked as picked up.");
    } catch (error) {
      console.error(error);
      setLocationError("Failed to update ride status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle ride cancellation
  const handleCancelRide = async () => {
    if (!acceptedRide) return;
    setLoading(true);
    try {
      await updateRide(acceptedRide.id, {
        status: "Cancelled",
        driverId: userId,
      });
      setAcceptedRide(null);
      setRideCreated(false);
      setRideStatus("");
      setDriverCoords(null);
      setRideId(null);
      setStartCoords(null);
      setEndCoords(null);
      setSnackbarVisible(true);
      console.log("Ride cancelled successfully.");
    } catch (error) {
      console.error(error);
      setLocationError("Failed to cancel ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Define markers with 'lat' and 'lng'
  const markers = [
    startCoords && {
      position: { lat: startCoords.latitude, lng: startCoords.longitude },
      title: "Start Location",
      icon: "green-dot.png",
    },
    endCoords && {
      position: { lat: endCoords.latitude, lng: endCoords.longitude },
      title: "End Location",
      icon: "red-dot.png",
    },
    driverCoords && {
      position: { lat: driverCoords.latitude, lng: driverCoords.longitude },
      title: "Driver Location",
      icon: "blue-dot.png",
    },
  ].filter(Boolean) as Array<{
    position: { lat: number; lng: number };
    title: string;
    icon: string;
  }>;

  // Define the path for Polyline with 'lat' and 'lng'
  const path =
    rideStatus === "In Transit" && driverCoords
      ? [
          { lat: driverCoords.latitude, lng: driverCoords.longitude },
          { lat: endCoords!.latitude, lng: endCoords!.longitude },
        ]
      : driverCoords
      ? [
          { lat: driverCoords.latitude, lng: driverCoords.longitude },
          { lat: startCoords!.latitude, lng: startCoords!.longitude },
          { lat: endCoords!.latitude, lng: endCoords!.longitude },
        ]
      : [];

  // Render Rider Map
  const renderRiderMap = () => {
    if (!startCoords || !endCoords) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    const latitudes = markers.map((m) => m.position.lat);
    const longitudes = markers.map((m) => m.position.lng);
    const center = {
      lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      lng: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    };

    return (
      <View style={styles.mapContainer}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={13}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position} // Now with 'lat' and 'lng'
                title={marker.title}
                icon={{
                  url: `http://maps.google.com/mapfiles/ms/icons/${marker.icon}`,
                }}
              />
            ))}
            {path.length > 0 && (
              <Polyline
                path={path}
                options={{
                  strokeColor: "#000",
                  strokeOpacity: 1,
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {/* Display ETA and Distance */}
        {/* {estimatedTime && estimatedDistance && ( */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>ETA: {estimatedTime}</Text>
          <Text style={styles.infoText}>Distance: {estimatedDistance}</Text>
        </View>
        {/* )} */}
      </View>
    );
  };

  // Render Driver Map
  const renderDriverMap = () => {
    if (!startCoords || !endCoords || !location) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    const markersWithDriver = [
      {
        position: { lat: location.latitude, lng: location.longitude },
        title: "Your Location",
        icon: "blue-dot.png",
      },
      ...markers.filter((marker) => marker.title !== "Driver Location"),
    ];

    const latitudes = markersWithDriver.map((m) => m.position.lat);
    const longitudes = markersWithDriver.map((m) => m.position.lng);
    const center = {
      lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      lng: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    };

    // Define path based on ride status
    const driverPath =
      rideStatus === "In Transit"
        ? [
            { lat: location.latitude, lng: location.longitude },
            { lat: endCoords.latitude, lng: endCoords.longitude },
          ]
        : [
            { lat: location.latitude, lng: location.longitude },
            { lat: startCoords.latitude, lng: startCoords.longitude },
            { lat: endCoords.latitude, lng: endCoords.longitude },
          ];

    return (
      <View style={styles.mapContainer}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={13}
          >
            {markersWithDriver.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                title={marker.title}
                icon={{
                  url: `http://maps.google.com/mapfiles/ms/icons/${marker.icon}`,
                }}
              />
            ))}
            <Polyline
              path={driverPath}
              options={{
                strokeColor: "#000",
                strokeOpacity: 1,
                strokeWeight: 3,
              }}
            />
          </GoogleMap>
        ) : (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {/* Display ETA and Distance */}
        {estimatedTime && estimatedDistance && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>ETA: {estimatedTime}</Text>
            <Text style={styles.infoText}>Distance: {estimatedDistance}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      {rideCreated ? (
        role === "rider" || role === "driver" ? (
          role === "rider" ? (
            renderRiderMap()
          ) : (
            renderDriverMap()
          )
        ) : (
          <ActivityIndicator size="large" style={styles.loader} />
        )
      ) : (
        <>
          <View style={styles.header}>
            <Text style={commonStyles.headerTitle}>Hi, </Text>
            <Text style={[commonStyles.headerTitle, { color: "#1D4E89" }]}>
              {fetchedUser?.firstName} {fetchedUser?.lastName}
            </Text>
          </View>

          {role === "rider" ? (
            <>
              <GooglePlacesAutocomplete
                placeholder="From"
                onPress={async (data) => {
                  setStartLocation(data.description);
                }}
                query={{
                  key: "AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw", // Replace with your actual API key
                  language: "en",
                }}
                requestUrl={{
                  useOnPlatform: "web",
                  url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
                }}
                styles={autocompleteStyles}
              />
              <GooglePlacesAutocomplete
                placeholder="To"
                onPress={async (data) => {
                  setEndLocation(data.description);
                }}
                query={{
                  key: "AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw", // Replace with your actual API key
                  language: "en",
                }}
                requestUrl={{
                  useOnPlatform: "web",
                  url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
                }}
                styles={autocompleteStyles}
              />

              <Button
                mode="contained"
                onPress={handleRequestRide}
                disabled={!startLocation || !endLocation || loading}
                style={styles.button}
              >
                Request Ride
              </Button>
            </>
          ) : (
            <FlatList
              data={requestedRides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.rideCard}>
                  <Card.Content>
                    <Text>Ride from: {item.startLocation}</Text>
                    <Text>Ride to: {item.endLocation}</Text>
                    <Text>
                      Rider: {item.rider.firstName} {item.rider.lastName}
                    </Text>
                    <Text>Status: {item.status}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      onPress={() => handleAcceptRide(item.id)}
                      disabled={loading}
                    >
                      Accept Ride
                    </Button>
                  </Card.Actions>
                </Card>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No requested rides available.
                </Text>
              }
            />
          )}
        </>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {rideStatus === "Cancelled"
          ? "Ride has been cancelled."
          : rideStatus === "In Transit"
          ? "Ride is now in transit."
          : role === "rider"
          ? "Ride requested successfully!"
          : "Ride accepted successfully!"}
      </Snackbar>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      {locationError && <Text style={styles.errorText}>{locationError}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};

const autocompleteStyles = {
  textInputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  textInput: {
    height: 44,
    color: "#5d5d5d",
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
};

const styles = StyleSheet.create({
  // Ensure that 'commonStyles' is defined elsewhere and imported if necessary
  ...commonStyles,
  header: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  button: {
    marginTop: 10,
    alignSelf: "center",
    width: "90%",
  },
  rideCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  loader: {
    marginTop: 20,
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  statusContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 5,
  },
  etaText: {
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  driverActions: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  actionButton: {
    width: "45%",
  },
  inTransitContainer: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 5,
  },
  inTransitText: {
    fontSize: 16,
    color: "#1D4E89",
  },
  mapContainer: {
    width: "100%",
    height: height * 0.7, // Adjust as needed
    position: "relative",
  },
  infoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 16,
    color: "#000",
  },
});

export default HomeScreen;
