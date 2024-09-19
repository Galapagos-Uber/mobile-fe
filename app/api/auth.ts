import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./index";
import { SignUpRequest, SignInRequest } from "./types";

export const signUp = async (data: SignUpRequest) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    console.error("Error signing up", error);
    throw error;
  }
};

export const signIn = async (data: SignInRequest) => {
  try {
    const response = await api.post("/auth/signin", data);
    if (response.data.accessToken) {
      await AsyncStorage.setItem("accessToken", response.data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const signOut = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("user");
  const response = await api.post("/auth/signout");
  return response.data;
};
