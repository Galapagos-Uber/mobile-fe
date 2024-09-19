import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUpFields } from "../hooks/useSignUpFields";

const SignUpScreen5: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { values, setValue, handleNext } = useSignUpFields([
    "gender",
    "pronoun",
  ]);

  const onNext = () => handleNext(navigation, "SignUp6");
  const onBack = () => navigation.goBack();

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const pronounOptions = ["He/Him", "She/Her", "They/Them", "Other"];

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="Select your gender and pronoun"
      step={5}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>What is your gender?</Text>
        <View style={styles.optionContainer}>
          {genderOptions.map((option) => (
            <TouchableRipple
              key={option}
              style={[
                styles.option,
                values.gender === option && styles.selectedOption,
              ]}
              onPress={() => setValue("gender", option)}
            >
              <Text
                style={[
                  styles.optionText,
                  values.gender === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </TouchableRipple>
          ))}
        </View>

        <Text style={styles.title}>What is your pronoun?</Text>
        <View style={styles.optionContainer}>
          {pronounOptions.map((option) => (
            <TouchableRipple
              key={option}
              style={[
                styles.option,
                values.pronoun === option && styles.selectedOption,
              ]}
              onPress={() => setValue("pronoun", option)}
            >
              <Text
                style={[
                  styles.optionText,
                  values.pronoun === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </TouchableRipple>
          ))}
        </View>
      </ScrollView>
    </SignUpBaseScreen>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "black",
    fontFamily: "JosefinSans_400Regular",
    textAlign: "center",
  },
  optionContainer: {
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
  optionText: {
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

export default SignUpScreen5;
