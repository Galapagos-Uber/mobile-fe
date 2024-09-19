import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUp } from "../context/SignUpContext";

const SignUpScreen6: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUpInfo, updateField } = useSignUp();
  const [password, setPassword] = useState(signUpInfo.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onNext = () => {
    if (password === confirmPassword) {
      updateField("password", password);
      navigation.navigate("SignUp7");
    } else {
      alert("Passwords do not match");
    }
  };

  const onBack = () => navigation.goBack();

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="Create a password for your account"
      step={6}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <TextInput
        label="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        style={styles.input}
        returnKeyType="next"
        right={
          <TextInput.Icon
            icon={passwordVisible ? "eye-off-outline" : "eye-outline"}
            onPress={() => setPasswordVisible(!passwordVisible)}
          />
        }
      />
      <TextInput
        label="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!confirmPasswordVisible}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={onNext}
        right={
          <TextInput.Icon
            icon={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          />
        }
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

export default SignUpScreen6;
