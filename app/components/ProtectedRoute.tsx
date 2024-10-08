import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import React, { useEffect } from "react";

type RootStackNavigationProp = NavigationProp<RootStackParamList>;

const ProtectedRoutes: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [loading, isAuthenticated, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1D4E89" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedRoutes;
