import React, { useState, useRef } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { signIn } from "../api/auth";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn: authenticate } = useAuth();

  const passwordInputRef = useRef<any>(null);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signIn({ email, password });
      if (response.accessToken) {
        await authenticate(response.accessToken);
        navigation.navigate("Main");
      } else {
        console.error("Sign in failed", response);
      }
    } catch (error) {
      console.error("Sign in error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.inner}>
        <Logo />
        <Text style={styles.title}>Log in</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          activeUnderlineColor="#1D4E89"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => {
            passwordInputRef.current?.focus();
          }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          activeUnderlineColor="#1D4E89"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          ref={passwordInputRef}
        />
        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Log in
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("SignUp1")}
          style={styles.signUpButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.signUpButtonLabel}
        >
          Sign up
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "black",
    fontFamily: "JosefinSans_400Regular",
  },
  input: {
    backgroundColor: "white",
    marginBottom: 20,
    fontFamily: "Inter_500Medium",
  },
  loginButton: {
    marginVertical: 10,
    backgroundColor: "#1D4E89",
  },
  signUpButton: {
    marginVertical: 10,
    borderColor: "#1D4E89",
  },
  buttonContent: {
    paddingVertical: 10,
  },
  buttonLabel: {
    color: "white",
  },
  signUpButtonLabel: {
    color: "#1D4E89",
  },
});

export default LoginScreen;
