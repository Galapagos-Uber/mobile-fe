import { useState } from "react";
import { useSignUp, SignUpInfo } from "../context/SignUpContext";

export const useSignUpFields = (fieldNames: (keyof SignUpInfo)[]) => {
  const { signUpInfo, updateFields } = useSignUp();
  const [values, setValues] = useState(() => {
    const initialValues: Partial<SignUpInfo> = {};
    fieldNames.forEach((fieldName) => {
      initialValues[fieldName] = signUpInfo[fieldName] || "";
    });
    return initialValues;
  });

  const setValue = (fieldName: keyof SignUpInfo, value: string) => {
    setValues((prevValues) => ({ ...prevValues, [fieldName]: value }));
  };

  const saveFields = () => {
    updateFields(values);
  };

  const handleNext = (navigation: any, nextScreen: string) => {
    saveFields();
    navigation.navigate(nextScreen);
  };

  return { values, setValue, saveFields, handleNext };
};
