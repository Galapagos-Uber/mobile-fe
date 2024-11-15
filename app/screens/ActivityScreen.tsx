import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Text, Card, ActivityIndicator, Snackbar, Button, Menu } from "react-native-paper";
import { useQuery } from "react-query";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";
import {
  getRidesByDriverId,
  getRidesByRiderId,
  RideResponseDto,
} from "../api/RideService";

const ActivityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userId, role, accessToken } = useAuth();
  const screenWidth = Dimensions.get("window").width;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [sortOption, setSortOption] = useState("dateDesc");
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    data: ridesData,
    isLoading,
    isError,
    refetch,
  } = useQuery<RideResponseDto[]>(
    ["rides", userId, role],
    async () => {
      if (role === "rider") {
        const response = await getRidesByRiderId(userId!);
        return response.data;
      } else {
        const response = await getRidesByDriverId(userId!);
        return response.data;
      }
    },
    {
      enabled: !!userId && !!accessToken,
      onError: () => setSnackbarVisible(true),
    }
  );

  const handleRetry = () => {
    setSnackbarVisible(false);
    refetch();
  };

  const sortedRides = () => {
    if (!ridesData) return [];

    return [...ridesData].sort((a, b) => {
      if (sortOption === "dateAsc") {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      } else if (sortOption === "dateDesc") {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      } else if (sortOption === "location") {
        return a.startLocation.localeCompare(b.startLocation);
      }
      return 0;
    });
  };

  return (
    <ScrollView
      style={commonStyles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <Text style={commonStyles.headerTitle}>Activity</Text>
      
      <View style={styles.sortContainer}>
        <Button onPress={() => setMenuVisible(true)} mode="outlined">
          Sort
        </Button>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Button onPress={() => setMenuVisible(true)}>Sort</Button>}
        >
          <Menu.Item onPress={() => { setSortOption("dateAsc"); setMenuVisible(false); }} title="Date Ascending" />
          <Menu.Item onPress={() => { setSortOption("dateDesc"); setMenuVisible(false); }} title="Date Descending" />
          <Menu.Item onPress={() => { setSortOption("location"); setMenuVisible(false); }} title="Location" />
        </Menu>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <View style={styles.container}>
          {sortedRides().map((ride, index) => (
            <Card
              key={ride.id}
              style={[styles.box, { width: screenWidth - screenWidth / 10 }]}
            >
              <Text style={styles.boxHeading}>
                Ride on{" "}
                {new Date(ride.createdDate).toLocaleDateString()}
              </Text>
              <Text style={styles.info}>From: {ride.startLocation}</Text>
              <Text style={styles.info}>To: {ride.endLocation}</Text>
              <Text style={styles.info}>
                {role === "rider"
                  ? `Driver: ${ride.driver?.firstName} ${ride.driver?.lastName}`
                  : `Rider: ${ride.rider?.firstName} ${ride.rider?.lastName}`}
              </Text>
              <Text style={styles.info}>Distance: {ride.distance} miles</Text>
              {/* <Text style={styles.info}>Fare: ${ride.fare?.toFixed(2)}</Text> */}
              <Text style={styles.info}>Status: {ride.status}</Text>

              {/* Vehicle Details */}
              {ride.driver?.vehicleDetails && (
                <View style={styles.vehicleDetails}>
                  <Text style={styles.info}>
                    Vehicle: {ride.driver.vehicleDetails.make}{" "}
                    {ride.driver.vehicleDetails.model} (
                    {ride.driver.vehicleDetails.year})
                  </Text>
                  <Text style={styles.info}>
                    License Plate: {ride.driver.vehicleDetails.licensePlate}
                  </Text>
                  <Text style={styles.info}>
                    Color: {ride.driver.vehicleDetails.color}
                  </Text>
                  <Text style={styles.info}>
                    Car Type: {ride.driver.vehicleDetails.carType}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "Retry",
          onPress: handleRetry,
        }}
        duration={Snackbar.DURATION_SHORT}
      >
        Unable to fetch latest data.
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  box: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  boxHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  info: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  loader: {
    marginTop: 20,
    alignSelf: "center",
  },
  vehicleDetails: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },
});

export default ActivityScreen;
