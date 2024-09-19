import { SignUpInfo, useSignUp } from "../context/SignUpContext";

export const useSignUpField = (fieldName: keyof SignUpInfo) => {
  const { signUpInfo, updateField } = useSignUp();
  const value = signUpInfo[fieldName] || "";

  const setValue = (newValue: any) => {
    updateField(fieldName, newValue);
  };

  const handleNext = (navigation: any, nextScreen: string) => {
    navigation.navigate(nextScreen);
  };

  return { value, setValue, handleNext };
};
