import api from "./index";
import { jwtDecode } from "jwt-decode";
import { User } from "./UserService";

interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  accessToken: string;
}

interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: "Male" | "Female" | "Others";
  password: string;
  preferredPaymentMethod: "Credit Card" | "PayPal" | "Cash";
}

interface DecodedToken {
  sub: string;
  role: "rider" | "driver";
}

export const signIn = async (
  credentials: SignInRequest
): Promise<{
  accessToken: string;
  userId: string;
  role: "rider" | "driver";
}> => {
  try {
    const response = await api.post<SignInResponse>(
      "/auth/signIn",
      credentials
    );
    const { accessToken } = response.data;

    const decodedToken = jwtDecode<DecodedToken>(accessToken);
    const userId = decodedToken.sub;
    const role = decodedToken.role;

    return { accessToken, userId, role };
  } catch (error: any) {
    console.error("Sign in error details:", error);

    throw new Error(
      error.response?.data?.message || "An error occurred during sign in"
    );
  }
};

export const signUp = async (userData: SignUpRequest): Promise<User> => {
  try {
    const response = await api.post<User>("/riders", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An error occurred during sign up"
    );
  }
};
