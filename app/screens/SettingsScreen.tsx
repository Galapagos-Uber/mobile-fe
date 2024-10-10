import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import {
  Text,
  Card,
  List,
  Appbar,
  Divider,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import { useQuery } from "react-query";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getRiderById } from "../api/RiderService";
import { getDriverById } from "../api/DriverService";
import { RiderResponseDto } from "../api/RiderService";
import { DriverResponseDto } from "../api/DriverService";
import { UserResponseDto } from "../api/UserService";
// import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userId, role, accessToken } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

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

  const handleEdit = () => {
    navigation.navigate("EditProfile");
  };

  useEffect(() => {
    if (isError) {
      setSnackbarVisible(true);
    }
  }, [isError]);

  return (
    <View style={commonStyles.container}>
      <Appbar.Header style={commonStyles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="black"
          size={20}
        />
        <Appbar.Content
          title="Settings"
          titleStyle={commonStyles.headerTitle}
        />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "Retry",
          onPress: () => {
            refetch();
          },
        }}
        duration={Snackbar.DURATION_SHORT}
      >
        Unable to fetch latest data.
      </Snackbar>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          fetchedUser && (
            <>
              {/* Avatar Section */}
              <Card style={styles.avatarCard}>
                <View style={styles.avatarContainer}>
                  {fetchedUser.avatarResourcePath ? (
                    <Image
                      source={{ uri: fetchedUser.avatarResourcePath }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Icon name="account" size={80} color="#9577D4" />
                  )}
                  <Text style={styles.userName}>
                    {fetchedUser.firstName} {fetchedUser.lastName}
                  </Text>
                </View>
              </Card>

              {/* User Information Section */}
              <Card style={styles.infoCard}>
                <List.Section>
                  <List.Item
                    title="Email"
                    description={fetchedUser.email}
                    left={() => <List.Icon icon="email" />}
                  />
                  <Divider />
                  <List.Item
                    title="Phone Number"
                    description={fetchedUser.phoneNumber}
                    left={() => <List.Icon icon="phone" />}
                  />
                  <Divider />
                  <List.Item
                    title="Date of Birth"
                    description={new Date(fetchedUser.dob).toLocaleDateString()}
                    left={() => <List.Icon icon="calendar" />}
                  />
                  <Divider />
                  <List.Item
                    title="Gender"
                    description={fetchedUser.gender}
                    left={() => <List.Icon icon="gender-male-female" />}
                  />
                  <Divider />
                  <List.Item
                    title="Account Status"
                    description={
                      fetchedUser.isActive === "True" ? "Active" : "Inactive"
                    }
                    left={() => <List.Icon icon="account-check" />}
                  />
                  <Divider />
                  {/* Show additional fields based on role */}
                  {role === "rider" &&
                    "preferredPaymentMethod" in fetchedUser && (
                      <List.Item
                        title="Preferred Payment Method"
                        description={fetchedUser.preferredPaymentMethod}
                        left={() => <List.Icon icon="credit-card" />}
                      />
                    )}
                  {role === "driver" && "licenseNumber" in fetchedUser && (
                    <>
                      <List.Item
                        title="License Number"
                        description={fetchedUser.licenseNumber}
                        left={() => <List.Icon icon="card-account-details" />}
                      />
                      <List.Item
                        title="Car"
                        description={
                          fetchedUser.vehicleDetails?.color +
                          fetchedUser.vehicleDetails?.make +
                          fetchedUser.vehicleDetails?.model +
                          fetchedUser.vehicleDetails?.year +
                          fetchedUser.vehicleDetails?.carType +
                          fetchedUser.vehicleDetails?.licensePlate
                        }
                        left={() => <List.Icon icon="car" />}
                      />
                    </>
                  )}
                </List.Section>
              </Card>
            </>
          )
        )}
        {/* <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: -34.603738,
            longitude: -58.38157,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          zoomTapEnabled={false}
        /> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingBottom: 40,
  },
  avatarCard: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    padding: 20,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: 20,
    alignSelf: "center",
  },
});

export default SettingsScreen;
