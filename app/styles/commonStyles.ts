import { StyleSheet } from "react-native";

const commonStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 20,
  },
  header: {
    backgroundColor: "white",
    elevation: 0, // for Android
    shadowOpacity: 0, // for iOS
  },
  headerTitle: {
    fontSize: 24,
    color: "black",
    fontFamily: "JosefinSans_600SemiBold",
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  backButton: {
    color: "black",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  primaryBlackText: {
    color: "black",
    fontFamily: "Inter_400Regular",
  },
  secondaryBlackText: {
    color: "black",
    fontFamily: "Inter_500Medium",
  },
  highlightText: {
    fontSize: 18,
    fontFamily: "JosefinSans_600Semibold",
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "white",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  button: {
    backgroundColor: "#1D4E89",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  outlinedButton: {
    borderColor: "#1D4E89",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  buttonLabel: {
    color: "white",
    fontFamily: "Inter_500Medium",
  },
  outlinedButtonLabel: {
    color: "#1D4E89",
    fontFamily: "Inter_500Medium",
  },
  progressBar: {
    marginVertical: 10,
    backgroundColor: "#E0E0E0",
  },
});

export default commonStyles;
