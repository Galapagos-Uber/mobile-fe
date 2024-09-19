import React from "react";
import { View, StyleSheet } from "react-native";

const ProgressDots = ({ step: currentStep }: { step: number }) => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
      <View
        key={stepNumber}
        style={[styles.dot, currentStep === stepNumber && styles.activeDot]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d3d3d3",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#1D4E89",
  },
});

export default ProgressDots;
