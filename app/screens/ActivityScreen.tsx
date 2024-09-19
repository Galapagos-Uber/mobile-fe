import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  ProgressBar,
  IconButton,
  Button,
  Modal,
  Portal,
} from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useQuery } from "react-query";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";

const ActivityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.headerTitle}>Activity</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  purpleButton: {
    backgroundColor: "#9577D4",
    marginHorizontal: 2,
  },
  hollowButton: {
    borderColor: "#9577D4",
    borderWidth: 2,
    borderRadius: 24,
    marginHorizontal: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalScrollView: {
    marginVertical: 20,
  },
  symptomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#9577D4",
  },
  cancelButton: {
    flex: 1,
    borderColor: "#9577D4",
  },
  infoValue: {
    color: "#9577D4",
    fontWeight: "bold",
  },
  babyImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
  },
  babyInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  trimesters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  trimesterText: {
    color: "black",
    fontFamily: "Inter_400Regular",
  },
  trimesterInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  symptomTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  tableData: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  mediumRisk: {
    backgroundColor: "#FFEB3B",
  },
  highRisk: {
    backgroundColor: "#FF6347",
  },
  lowRisk: {
    backgroundColor: "#32CD32",
  },
  greyText: {
    color: "grey",
    fontFamily: "Inter_500Medium",
    marginBottom: 10,
  },
  buttonLabel: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buttonLabelText: {
    color: "white",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});

export default ActivityScreen;
