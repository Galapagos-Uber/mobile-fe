import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import {
  DatePickerModal,
  registerTranslation,
  en,
} from "react-native-paper-dates";
import SignUpBaseScreen from "./SignUpBaseScreen";
import { useSignUpField } from "../hooks/useSignUpField";
import { SingleChange } from "react-native-paper-dates/lib/typescript/Date/Calendar";

registerTranslation("en", en);

const SignUpScreen4: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { value: dob, setValue: setDob, handleNext } = useSignUpField("dob");
  const [open, setOpen] = React.useState(false);

  const onNext = () => handleNext(navigation, "SignUp5");
  const onBack = () => navigation.goBack();

  const onDismiss = () => {
    setOpen(false);
  };

  const onConfirm: SingleChange = ({ date }) => {
    setOpen(false);
    if (date) {
      const selectedDate = date.toISOString();
      setDob(selectedDate);
    }
  };

  return (
    <SignUpBaseScreen
      navigation={navigation}
      title="What's your birthday?"
      step={4}
      onNext={onNext}
      onBack={onBack}
      showBackIcon
    >
      <Button
        onPress={() => setOpen(true)}
        mode="outlined"
        style={styles.input}
        labelStyle={styles.dateLabel}
      >
        {dob ? new Date(dob).toLocaleDateString() : "Pick a date"}
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismiss}
        date={dob ? new Date(dob) : new Date()}
        onConfirm={onConfirm}
      />
    </SignUpBaseScreen>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    marginBottom: 20,
    borderColor: "#1D4E89",
    borderWidth: 1,
    borderRadius: 20,
  },
  dateLabel: {
    color: "black",
    fontFamily: "Inter_500Medium",
  },
});

export default SignUpScreen4;
