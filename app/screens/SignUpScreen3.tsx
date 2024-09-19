import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUpFields } from "../hooks/useSignUpFields";

const SignUpScreen3: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { values, setValue, handleNext } = useSignUpFields([
    "email",
    "phoneNumber",
  ]);

  const onNext = () => handleNext(navigation, "SignUp4");
  const onBack = () => navigation.goBack();

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="What's your contact information?"
      step={3}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <TextInput
        label="Email"
        value={values.email || ""}
        onChangeText={(text) => setValue("email", text)}
        style={styles.input}
        activeUnderlineColor="#1D4E89"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <TextInput
        label="Phone Number"
        value={values.phoneNumber || ""}
        onChangeText={(text) => setValue("phoneNumber", text)}
        style={styles.input}
        activeUnderlineColor="#1D4E89"
        keyboardType="phone-pad"
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

export default SignUpScreen3;
