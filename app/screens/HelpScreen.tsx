import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card, List, Appbar, Divider } from "react-native-paper";
import { useQuery } from "react-query";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";

const HelpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={commonStyles.container}>
      <Appbar.Header style={commonStyles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color="black"
          size={20}
        />
        <Appbar.Content title="Help" titleStyle={commonStyles.headerTitle} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollViewContent}></ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    fontFamily: "JosefinSans_400Regular",
    textAlign: "left",
  },
  cardIcon: {
    marginRight: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  boldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  infoValue: {
    fontSize: 16,
    color: "black",
    fontFamily: "Inter_500Medium",
  },
  editLink: {
    fontSize: 16,
    color: "#9577D4",
    fontFamily: "Inter_500Medium",
    marginTop: 10,
  },
});

export default HelpScreen;
