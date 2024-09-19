import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUpField } from "../hooks/useSignUpField";

const SignUpScreen1: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    value: userType,
    setValue: setUserType,
    handleNext,
  } = useSignUpField("userType");

  const onNext = () => handleNext(navigation, "SignUp2");
  const onBack = () => navigation.goBack();

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="Are you a ... ?"
      step={1}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <View style={styles.container}>
        <TouchableRipple
          style={[styles.option, userType === "rider" && styles.selectedOption]}
          onPress={() => setUserType("rider")}
        >
          <Text
            style={[styles.text, userType === "rider" && styles.selectedText]}
          >
            Rider
          </Text>
        </TouchableRipple>
        <TouchableRipple
          style={[
            styles.option,
            userType === "driver" && styles.selectedOption,
          ]}
          onPress={() => setUserType("driver")}
        >
          <Text
            style={[styles.text, userType === "driver" && styles.selectedText]}
          >
            Driver
          </Text>
        </TouchableRipple>
      </View>
    </SignUpBaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  option: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1D4E89",
    alignItems: "center",
    marginVertical: 5,
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 16,
    color: "black",
    fontFamily: "Inter_500Medium",
  },
  selectedOption: {
    backgroundColor: "#1D4E89",
  },
  selectedText: {
    color: "white",
  },
});

export default SignUpScreen1;
