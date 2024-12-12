import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

interface DriverActionsProps {
  onPassengerPickedUp: () => void;
  onCancelRide: () => void;
}

const DriverActions: React.FC<DriverActionsProps> = ({
  onPassengerPickedUp,
  onCancelRide,
}) => {
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={onPassengerPickedUp}
        style={styles.button}
      >
        Passenger Picked Up
      </Button>
      <Button mode="contained" onPress={onCancelRide} style={styles.button}>
        Cancel Ride
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  button: {
    flex: 0.48,
    paddingVertical: 5, // Smaller buttons
    backgroundColor: "#1D4E89",
  },
});

export default DriverActions;
