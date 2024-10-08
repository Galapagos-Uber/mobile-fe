import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../api/UserService";
import { VehicleResponseDto } from "../api/VehicleService";

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  role: "rider" | "driver" | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const roleData = await AsyncStorage.getItem("role");

        if (token && roleData) {
          const decodedToken: { sub: string } = jwtDecode(token);
          const userId = decodedToken.sub;

          // const userProfile = await getUserProfile(userId);

          setAccessToken(token);
          setUserId(userId);
          setRole(roleData as "rider" | "driver");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTokenAndUser();
  }, []);

  const signIn = async (token: string): Promise<void> => {
    try {
      console.log(token);
      const decodedToken: { sub: string; role: "rider" | "driver" } =
        jwtDecode(token);
      const userId = decodedToken.sub;
      const userRole = decodedToken.role;

      const userProfile = await getUserProfile(userId, userRole);

      setIsAuthenticated(true);
      setAccessToken(token);
      setUserId(userId);
      setRole(userRole);

      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("role", userRole);
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw new Error("Failed to sign in");
    }
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setUserId(null);
    setRole(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("role");
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        accessToken,
        role,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
