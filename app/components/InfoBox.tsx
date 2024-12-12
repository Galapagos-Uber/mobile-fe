import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InfoBoxProps {
  eta: string;
  distance: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ eta, distance }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ETA: {eta}</Text>
      <Text style={styles.text}>Distance: {distance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 3.84, // For iOS shadow
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
});

export default InfoBox;
