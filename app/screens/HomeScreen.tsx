import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  IconButton,
  ProgressBar,
  Button,
} from "react-native-paper";
import commonStyles from "../styles/commonStyles";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "react-query";

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.headerTitle}>Hi,</Text>
        <Text style={[commonStyles.headerTitle, { color: "#1D4E89" }]}>
          user.firstName
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  header: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  progressBar: {
    marginVertical: 10,
    backgroundColor: "#E0E0E0",
  },
  trackerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackerIcon: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  trackerProgressBarContainer: {
    flex: 1,
    marginLeft: 10,
  },
  trackerProgressBar: {
    backgroundColor: "#E0E0E0",
  },
  articleContainer: {
    paddingVertical: 10,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  authorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  articleInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  articleTitle: {
    fontSize: 20,
    color: "black",
    fontFamily: "JosefinSans_500Medium",
  },
  articleAuthor: {
    fontSize: 14,
    color: "grey",
    fontFamily: "Inter_500Medium",
  },
  articleDate: {
    fontSize: 14,
    color: "grey",
    fontFamily: "Inter_500Medium",
  },
  articlePreview: {
    marginTop: 5,
    color: "grey",
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "grey",
    marginVertical: 10,
  },
});

export default HomeScreen;
