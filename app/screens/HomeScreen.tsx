import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions, FlatList, Text } from "react-native";
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
import DriverActions from "../components/DriverActions"; // Adjust the path as necessary
import InfoBox from "../components/InfoBox"; // Adjust the path as necessary

// Ensure that @types/google.maps is installed
// npm install --save-dev @types/google.maps

const { width, height } = Dimensions.get("window");
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDLUq8iwf_zsBQNVClpKFoOY1ZqdSZipJw", // Replace with your actual API key
  });

  const { userId, role, accessToken } = useAuth();

  if (!userId) {
    return <Text>Please log in to view this page.</Text>;
  }

  // State Variables
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

  // Map Reference
  const mapRef = useRef<google.maps.Map | null>(null);

  // Fetch User Profile
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

  // Fetch User's Current Location
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

  // Fetch Requested Rides for Drivers
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

  // Polling to Check Ride Status (Rider Side)
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
                {
                  latitude: location!.latitude,
                  longitude: location!.longitude,
                },
                {
                  latitude: startCoords!.latitude,
                  longitude: startCoords!.longitude,
                },
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

            if (ride.status === "Completed") {
              setSnackbarVisible(true);
              console.log("Ride has been completed.");
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

  // Geocode Address to Coordinates with CORS Proxy
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

  // Handle Ride Request (Rider Side)
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
      setRideStatus("Requested");
      console.log("Ride requested successfully.");
    } catch (error) {
      console.error(error);
      setLocationError("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Ride Acceptance (Driver Side)
  const handleAcceptRide = async (rideId: string) => {
    setLoading(true);
    try {
      await updateRide(rideId, {
        status: "Dispatched", // Update status to "Dispatched"
        driverId: userId,
      });
      setRequestedRides((prevRides) =>
        prevRides.filter((ride) => ride.id !== rideId)
      );

      const acceptedRideData = await getRideById(rideId).then(
        (res) => res.data
      );
      setAcceptedRide(acceptedRideData || null);

      if (
        acceptedRideData &&
        acceptedRideData.startLocation &&
        acceptedRideData.endLocation &&
        location
      ) {
        const riderStartCoords = await geocodeAddress(
          acceptedRideData.startLocation
        );
        const riderEndCoords = await geocodeAddress(
          acceptedRideData.endLocation
        );
        if (riderStartCoords && riderEndCoords) {
          setStartCoords({
            latitude: riderStartCoords.lat,
            longitude: riderStartCoords.lng,
          });
          setEndCoords({
            latitude: riderEndCoords.lat,
            longitude: riderEndCoords.lng,
          });
          setRideCreated(true);
          setRideStatus("Dispatched");
          setDriverCoords({
            latitude: location.latitude,
            longitude: location.longitude,
          });

          // Calculate ETA and distance
          calculateDistanceAndTime(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: riderStartCoords.lat, longitude: riderStartCoords.lng },
            setEstimatedTime,
            setEstimatedDistance
          );
        }
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

  // Helper Function to Calculate Distance Using Haversine Formula
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

  // Function to Simulate Driver Movement Towards Rider's Start Location
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
      setRideStatus("In Transit");
      if (driverMovementInterval.current) {
        clearInterval(driverMovementInterval.current);
        driverMovementInterval.current = null;
      }
      console.log("Driver has arrived near the rider.");
    }
  };

  // Function to Simulate Start Location Moving Towards End Location
  const moveStartTowardsEnd = () => {
    if (!startCoords || !endCoords) return;

    const step = 0.001; // Adjust for desired speed

    let newLatitude = startCoords.latitude;
    let newLongitude = startCoords.longitude;

    if (Math.abs(startCoords.latitude - endCoords.latitude) > step) {
      newLatitude += startCoords.latitude < endCoords.latitude ? step : -step;
    }

    if (Math.abs(startCoords.longitude - endCoords.longitude) > step) {
      newLongitude +=
        startCoords.longitude < endCoords.longitude ? step : -step;
    }

    setStartCoords({
      latitude: newLatitude,
      longitude: newLongitude,
    });

    // Recalculate ETA and distance
    calculateDistanceAndTime(
      { latitude: newLatitude, longitude: newLongitude },
      { latitude: endCoords.latitude, longitude: endCoords.longitude },
      setEstimatedTime,
      setEstimatedDistance
    );

    // Check if start location has arrived at end location
    const distance = getDistance(
      { latitude: newLatitude, longitude: newLongitude },
      { latitude: endCoords.latitude, longitude: endCoords.longitude }
    );
    console.log("Start to End Distance:", distance);

    if (distance < 0.05) {
      // Approximately 50 meters
      setRideStatus("Completed");
      if (startMovementInterval.current) {
        clearInterval(startMovementInterval.current);
        startMovementInterval.current = null;
      }
      console.log("Ride has been completed.");
      setSnackbarVisible(true);
    }
  };

  // Refs for Intervals
  const driverMovementInterval = useRef<NodeJS.Timeout | null>(null);
  const startMovementInterval = useRef<NodeJS.Timeout | null>(null);

  // Manage Driver Movement Simulation
  useEffect(() => {
    if (role === "driver" && acceptedRide && rideStatus === "Dispatched") {
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

  // Handle Ride Status "In Transit"
  useEffect(() => {
    if (rideStatus === "In Transit") {
      // Remove driver's marker by setting driverCoords to null
      setDriverCoords(null);
      console.log("Driver's marker removed.");

      // Start simulating start location moving towards end location
      if (!startMovementInterval.current) {
        startMovementInterval.current = setInterval(
          moveStartTowardsEnd,
          5000 // Move every 5 seconds
        );
        console.log("Start location movement simulation started.");
      }
    }
  }, [rideStatus]);

  // Handle Passenger Picked Up
  const handlePassengerPickedUp = async () => {
    if (!acceptedRide) return;
    setLoading(true);
    try {
      await updateRide(acceptedRide.id, {
        status: "In Transit", // Update status to "In Transit"
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

  // Handle Ride Cancellation
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

  // Define Markers with 'lat' and 'lng'
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
    position: google.maps.LatLngLiteral;
    title: string;
    icon: string;
  }>;

  // Define the Path for Polyline with 'lat' and 'lng'
  const path: google.maps.LatLngLiteral[] = [];

  if (rideStatus === "Dispatched" && driverCoords && startCoords && endCoords) {
    // Polyline from Driver to Start to End
    path.push(
      { lat: driverCoords.latitude, lng: driverCoords.longitude },
      { lat: startCoords.latitude, lng: startCoords.longitude },
      { lat: endCoords.latitude, lng: endCoords.longitude }
    );
  } else if (rideStatus === "In Transit" && startCoords && endCoords) {
    // Polyline from Start to End
    path.push(
      { lat: startCoords.latitude, lng: startCoords.longitude },
      { lat: endCoords.latitude, lng: endCoords.longitude }
    );
  } else if (rideStatus === "Completed" && startCoords && endCoords) {
    // Optional: Add any final polyline or actions upon completion
    path.push(
      { lat: startCoords.latitude, lng: startCoords.longitude },
      { lat: endCoords.latitude, lng: endCoords.longitude }
    );
  }

  // Render Start and End Location Information at the Top
  const renderStartEndInfo = () => {
    if (!startLocation || !endLocation) return null;

    return (
      <View style={styles.startEndContainer}>
        <Text style={styles.startEndText}>From: {startLocation}</Text>
        <Text style={styles.startEndText}>To: {endLocation}</Text>
      </View>
    );
  };

  // Render InfoBox for ETA and Distance
  const renderInfoBox = () => {
    if (!estimatedTime || !estimatedDistance) return null;

    return <InfoBox eta={estimatedTime} distance={estimatedDistance} />;
  };

  // Render DriverActions Conditionally
  const renderDriverActions = () => {
    if (
      role !== "driver" ||
      !acceptedRide ||
      rideStatus !== "Dispatched" // Only show when status is "Dispatched"
    )
      return null;

    return (
      <DriverActions
        onPassengerPickedUp={handlePassengerPickedUp}
        onCancelRide={handleCancelRide}
      />
    );
  };

  // Initialize map center once to prevent re-centering
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }, [location, mapCenter]);

  // Render Rider Map
  const renderRiderMap = () => {
    if (!startCoords || !endCoords || !mapCenter) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
      <View style={styles.mapContainer}>
        {renderStartEndInfo()}
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "200%" }}
            center={mapCenter} // Set center only once
            zoom={13}
            onLoad={(map) => {
              mapRef.current = map;
            }}
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
                  strokeColor: "#1D4E89", // Consistent color
                  strokeOpacity: 1,
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {renderInfoBox()}
      </View>
    );
  };

  // Render Driver Map
  const renderDriverMap = () => {
    if (!startCoords || !endCoords || !mapCenter) {
      return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
      <View style={styles.mapContainer}>
        {renderStartEndInfo()}
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter} // Set center only once
            zoom={13}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
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
                  strokeColor: "#1D4E89", // Consistent color
                  strokeOpacity: 1,
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {renderInfoBox()}
        {renderDriverActions()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Hi, </Text>
            <Text style={[styles.headerTitle, { color: "#1D4E89" }]}>
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
                style={styles.requestButton}
                labelStyle={styles.requestButtonLabel}
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
                      style={styles.acceptButton}
                      labelStyle={styles.acceptButtonLabel}
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
          : rideStatus === "Completed"
          ? "Ride has been completed."
          : rideStatus === "Dispatched"
          ? "Ride has been dispatched."
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  requestButton: {
    marginTop: 10,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#1D4E89",
  },
  requestButtonLabel: {
    color: "#FFFFFF",
  },
  rideCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: "#1D4E89",
  },
  acceptButtonLabel: {
    color: "#FFFFFF",
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
  mapContainer: {
    width: "100%",
    height: height * 0.6, // Adjust as needed
    position: "relative",
    marginBottom: 20,
  },
  startEndContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 3.84, // For iOS shadow
    zIndex: 1,
  },
  startEndText: {
    fontSize: 16,
    color: "#000",
  },
});

export default HomeScreen;
