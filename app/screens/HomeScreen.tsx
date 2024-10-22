import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, FlatList, Platform } from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/mymap.web";
var { Marker, Polyline, PROVIDER_GOOGLE } =
  require("react-native-maps").default;
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  createRide,
  updateRide,
  getRidesByDriverId,
  getRideById,
  RideResponseDto,
  getRides,
} from "../api/RideService";
import { useQuery } from "react-query";
import { UserResponseDto } from "../api/UserService";
import { getRiderById } from "../api/RiderService";
import { getDriverById } from "../api/DriverService";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw",
  });

  const { userId, role, accessToken } = useAuth();

  if (!userId) {
    return <Text>Please log in to view this page.</Text>;
  }

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State variables to hold coordinates
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
    isLoading,
    isError,
    refetch,
  } = useQuery<UserResponseDto>(
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
    }
    return () => {
      if (interval) {
        clearInterval(interval);
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
            if (ride.status === "Dispatched" && ride.driver.id) {
              setRideStatus("Ride Accepted");
              // Simulate as rider's own location
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
          })
          .catch((error) => {
            console.error("Failed to fetch ride status:", error);
          });
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [role, rideCreated, rideId, startCoords, driverCoords, location]);

  // Google Distance Matrix API
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
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&key=AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const element = data.rows[0].elements[0];
        if (element.status === "OK") {
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

  // Geocode address to coordinates
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
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
      const startCoords = await geocodeAddress(startLocation);
      const endCoords = await geocodeAddress(endLocation);

      if (!startCoords || !endCoords) {
        setLocationError("Failed to geocode addresses. Please try again.");
        setLoading(false);
        return;
      }

      setStartCoords(startCoords);
      setEndCoords(endCoords);

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
    } catch (error) {
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

      const acceptedRide = await getRidesByDriverId(userId).then((res) =>
        res.data.find((ride) => ride.id === rideId)
      );
      setAcceptedRide(acceptedRide || null);

      if (acceptedRide) {
        const riderStartCoords = await geocodeAddress(
          acceptedRide.startLocation
        );
        const riderEndCoords = await geocodeAddress(acceptedRide.endLocation);
        setStartCoords(riderStartCoords);
        setEndCoords(riderEndCoords);
        setRideCreated(true);
        setRideStatus("Ride Accepted");
        setDriverCoords(location);

        calculateDistanceAndTime(
          driverCoords,
          startCoords,
          setEstimatedTime,
          setEstimatedDistance
        );
      }
      setSnackbarVisible(true);
    } catch (error) {
      setLocationError("Failed to accept ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRiderMap = () => {
    if (!startCoords || !endCoords) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    const markers = [startCoords, endCoords];
    if (driverCoords) {
      markers.push(driverCoords);
    }
    const latitudes = markers.map((m) => m.latitude);
    const longitudes = markers.map((m) => m.longitude);
    const region = {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      latitudeDelta: (Math.max(...latitudes) - Math.min(...latitudes)) * 2,
      longitudeDelta: (Math.max(...longitudes) - Math.min(...longitudes)) * 2,
    };

    return (
      <View style={{ flex: 1 }}>
        <MapView style={{ flex: 1 }} provider={PROVIDER_GOOGLE} region={region}>
          <Marker
            coordinate={startCoords}
            title="Start Location"
            pinColor="green"
          />
          <Marker coordinate={endCoords} title="End Location" pinColor="red" />
          {driverCoords && (
            <Marker
              coordinate={driverCoords}
              title="Driver Location"
              pinColor="blue"
            />
          )}
          {driverCoords && (
            <Polyline
              coordinates={[driverCoords, startCoords, endCoords]}
              strokeColor="#000"
              strokeWidth={3}
            />
          )}
        </MapView>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{rideStatus}</Text>
          {rideStatus === "Ride Accepted" && (
            // estimatedTime &&
            // estimatedDistance &&
            <Text style={styles.etaText}>
              ETA: {estimatedTime} | Distance: {estimatedDistance}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderDriverMap = () => {
    if (!startCoords || !endCoords || !location) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    const markers = [location, startCoords, endCoords];
    const latitudes = markers.map((m) => m.latitude);
    const longitudes = markers.map((m) => m.longitude);
    const region = {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      latitudeDelta: (Math.max(...latitudes) - Math.min(...latitudes)) * 2,
      longitudeDelta: (Math.max(...longitudes) - Math.min(...longitudes)) * 2,
    };

    return (
      <View style={{ flex: 1 }}>
        <MapView style={{ flex: 1 }} provider={PROVIDER_GOOGLE} region={region}>
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
          <Marker
            coordinate={startCoords}
            title="Rider Start Location"
            pinColor="green"
          />
          <Marker
            coordinate={endCoords}
            title="Rider End Location"
            pinColor="red"
          />
          <Polyline
            coordinates={[location, startCoords, endCoords]}
            strokeColor="#000"
            strokeWidth={3}
          />
        </MapView>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{rideStatus}</Text>
          {rideStatus === "Ride Accepted" && (
            // estimatedTime &&
            // estimatedDistance &&
            <Text style={styles.etaText}>
              ETA: {estimatedTime} | Distance: {estimatedDistance}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      {rideCreated ? (
        isLoaded ? (
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
                onPress={(data) => setStartLocation(data.description)}
                query={{
                  key: "AIzaSyALn0S4rac4u9_a07ULsqMK5MOk727r_NI",
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
                onPress={(data) => setEndLocation(data.description)}
                query={{
                  key: "AIzaSyALn0S4rac4u9_a07ULsqMK5MOk727r_NI",
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
        {role === "rider"
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
});

export default HomeScreen;
