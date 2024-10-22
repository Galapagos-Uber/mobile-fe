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
var { Marker, PROVIDER_GOOGLE } = require("react-native-maps").default;
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  createRide,
  updateRide,
  getRidesByDriverId,
  RideResponseDto,
  getRides,
} from "../api/RideService";
import { useQuery } from "react-query";
import { UserResponseDto } from "../api/UserService";
import { getRiderById } from "../api/RiderService";
import { getDriverById } from "../api/DriverService";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import * as Location from "expo-location";
// import { LocationObjectCoords } from "expo-location";

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
  const [errorMsg, setErrorMsg] = useState<String | null>(null);

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

  const [rideCreated, setRideCreated] = useState(false);
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [requestedRides, setRequestedRides] = useState<RideResponseDto[]>([]);

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

  const {
    data: ridesData,
    isLoading: isRidesLoading,
    isError: isRidesError,
    refetch: refetchRides,
  } = useQuery<RideResponseDto[]>(
    ["rides", role, userId],
    () =>
      role === "driver" && userId
        ? getRidesByDriverId(userId).then((res) => res.data)
        : Promise.resolve([]),
    {
      enabled: role === "driver" && !!userId && !!accessToken,
      onError: () => setSnackbarVisible(true),
    }
  );

  useEffect(() => {
    if (role === "driver") {
      setLoading(true);
      // getRidesByDriverId(userId)
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
    }
  }, [role, userId]);

  const handleRequestRide = async () => {
    if (!startLocation || !endLocation) {
      setLocationError("Please select both start and end locations.");
      return;
    }

    setLoading(true);
    try {
      await createRide({
        riderId: userId,
        startLocation,
        endLocation,
      });
      setLocationError(null);
      setSnackbarVisible(true);
      setRideCreated(true);
    } catch (error) {
      setLocationError("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setLoading(true);
    try {
      await updateRide(rideId, { status: "Dispatched", driverId: userId });
      setRequestedRides((prevRides) =>
        prevRides.filter((ride) => ride.id !== rideId)
      );
      setSnackbarVisible(true);
    } catch (error) {
      setLocationError("Failed to accept ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      {rideCreated ? (
        isLoaded ? (
          <MapView
            // style={styles.map}
            provider={PROVIDER_GOOGLE}
            // initialRegion={{
            //   latitude: 40.034901,
            //   longitude: -75.337349,
            //   latitudeDelta: 0.01,
            //   longitudeDelta: 0.01,
            // }}
            region={{
              latitude: location?.latitude,
              longitude: location?.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: location?.latitude,
                longitude: location?.longitude,
              }}
              title="You are here"
            />
          </MapView>
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
                  url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api", // or any proxy server that hits https://maps.googleapis.com/maps/api
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
          ? "Ride created successfully!"
          : "Ride accepted successfully!"}
      </Snackbar>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      {locationError && <Text style={styles.errorText}>{locationError}</Text>}
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
});

export default HomeScreen;
