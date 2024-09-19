import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button, IconButton } from "react-native-paper";
import Logo from "../components/Logo";
import ProgressDots from "../components/ProgressDots";
import commonStyles from "../styles/commonStyles";

interface SignUpBaseScreenProps {
  navigation: any;
  title: string;
  step: number;
  onNext: () => void;
  onBack: () => void;
  showBackIcon?: boolean;
  children: React.ReactNode;
}

const SignUpBaseScreen: React.FC<SignUpBaseScreenProps> = ({
  navigation,
  title,
  step,
  onNext,
  onBack,
  showBackIcon = false,
  children,
}) => {
  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.inner}>
        {showBackIcon && (
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="black"
            onPress={onBack}
            style={styles.backIconButton}
          />
        )}
        <Logo />
        <Text style={styles.title}>{title}</Text>
        {children}
        <View style={styles.dots}>
          <ProgressDots step={step} />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={onNext}
            style={styles.continueButton}
            labelStyle={commonStyles.buttonLabel}
          >
            Continue
          </Button>
          <Button
            mode="outlined"
            onPress={onBack}
            style={styles.backButton}
            labelStyle={commonStyles.outlinedButtonLabel}
          >
            Back
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  backIconButton: {
    position: "absolute",
    top: 10,
    left: 0,
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

export default SignUpBaseScreen;
