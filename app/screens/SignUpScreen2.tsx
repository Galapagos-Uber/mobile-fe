import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUpFields } from "../hooks/useSignUpFields";

const SignUpScreen2: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { values, setValue, handleNext } = useSignUpFields([
    "firstName",
    "lastName",
  ]);

  const onNext = () => handleNext(navigation, "SignUp3");
  const onBack = () => navigation.goBack();

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="What's your name?"
      step={2}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <TextInput
        label="First name"
        value={values.firstName || ""}
        onChangeText={(text) => setValue("firstName", text)}
        style={styles.input}
        activeUnderlineColor="#1D4E89"
        returnKeyType="next"
      />
      <TextInput
        label="Last name"
        value={values.lastName || ""}
        onChangeText={(text) => setValue("lastName", text)}
        style={styles.input}
        activeUnderlineColor="#1D4E89"
        returnKeyType="done"
        onSubmitEditing={onNext}
      />
    </SignUpBaseScreen>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    marginBottom: 20,
    fontFamily: "Inter_500Medium",
  },
});

export default SignUpScreen2;
