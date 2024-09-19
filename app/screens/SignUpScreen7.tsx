import React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Text, Button } from "react-native-paper";
import Logo from "../components/Logo";
import ProgressDots from "../components/ProgressDots";
import commonStyles from "../styles/commonStyles";
import { useSignUp } from "../context/SignUpContext";
import { signUp } from "../api/auth";

const SignUpScreen7: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUpInfo } = useSignUp();

  const firstName = signUpInfo.firstName || "";
  const lastName = signUpInfo.lastName || "";
  const email = signUpInfo.email || "";
  const password = signUpInfo.password || "";
  const dob = signUpInfo.dob || "";
  const gender = signUpInfo.gender || "";
  const pronoun = signUpInfo.pronoun || "";

  const handleSignUp = async () => {
    // try {
    //   if (!email || !password || !dob) {
    //     alert("Please ensure all required fields are filled.");
    //     return;
    //   }

    //   const response = await signUp({
    //     firstName,
    //     lastName,
    //     email,
    //     password,
    //     dob,
    //     gender,
    //     pronoun,
    //   });

    //   if (response.id) {
    navigation.navigate("Login");
    //   }
    // } catch (error) {
    //   console.error("Sign up error", error);
    //   alert("There was an error during sign up. Please try again.");
    // }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Logo />
          <Text style={styles.title}>
            Welcome to Uber,{" "}
            <Text>
              {firstName} {lastName}
            </Text>
          </Text>
          <View style={styles.dots}>
            <ProgressDots step={7} />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSignUp}
              style={styles.continueButton}
              labelStyle={commonStyles.buttonLabel}
            >
              Get Started
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              labelStyle={commonStyles.outlinedButtonLabel}
            >
              Back
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  continueButton: {
    flex: 7,
    backgroundColor: "#1D4E89",
    marginRight: 10,
    borderRadius: 20,
  },
  backButton: {
    flex: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1D4E89",
  },
  dots: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
  },
});

export default SignUpScreen7;
