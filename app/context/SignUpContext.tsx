import React, {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useMemo,
} from "react";

export type SignUpInfo = Partial<{
  userType: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dob: string;
  gender: string;
  pronoun: string;
  password: string;
  location: string;
}>;

interface SignUpContextProps {
  signUpInfo: SignUpInfo;
  updateField: (field: keyof SignUpInfo, value: any) => void;
  updateFields: (fields: Partial<SignUpInfo>) => void; // Add this line
}

const SignUpContext = createContext<SignUpContextProps | undefined>(undefined);

export const useSignUp = (): SignUpContextProps => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error("useSignUp must be used within a SignUpProvider");
  }
  return context;
};

type SignUpAction =
  | {
      type: "UPDATE_FIELD";
      payload: { field: keyof SignUpInfo; value: any };
    }
  | {
      type: "UPDATE_FIELDS";
      payload: Partial<SignUpInfo>;
    };

const signUpReducer = (state: SignUpInfo, action: SignUpAction): SignUpInfo => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.payload.field]: action.payload.value };
    case "UPDATE_FIELDS":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const SignUpProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [signUpInfo, dispatch] = useReducer(signUpReducer, {});

  const updateField = (field: keyof SignUpInfo, value: any) => {
    dispatch({ type: "UPDATE_FIELD", payload: { field, value } });
  };

  const updateFields = (fields: Partial<SignUpInfo>) => {
    dispatch({ type: "UPDATE_FIELDS", payload: fields });
  };

  const contextValue = useMemo(
    () => ({ signUpInfo, updateField, updateFields }), // Include updateFields here
    [signUpInfo]
  );

  return (
    <SignUpContext.Provider value={contextValue}>
      {children}
    </SignUpContext.Provider>
  );
};
