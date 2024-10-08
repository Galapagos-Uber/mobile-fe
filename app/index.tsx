import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Provider as PaperProvider,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  JosefinSans_700Bold,
} from "@expo-google-fonts/josefin-sans";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "react-query";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen1 from "./screens/SignUpScreen1";
import SignUpScreen2 from "./screens/SignUpScreen2";
import SignUpScreen3 from "./screens/SignUpScreen3";
import SignUpScreen4 from "./screens/SignUpScreen4";
import SignUpScreen5 from "./screens/SignUpScreen5";
import SignUpScreen6 from "./screens/SignUpScreen6";
import SignUpScreen7 from "./screens/SignUpScreen7";
import HomeScreen from "./screens/HomeScreen";
import HelpScreen from "./screens/HelpScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MoreOptionsModal from "./components/MoreOptionsModal";
import { SignUpProvider } from "./context/SignUpContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./components/ProtectedRoute";
import ActivityScreen from "./screens/ActivityScreen";
import { View } from "react-native";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const queryClient = new QueryClient();

function MorePlaceholder() {
  return null;
}

function MainTabs() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#1D4E89",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "white",
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: string;

            switch (route.name) {
              case "HomeTab":
                iconName = "home-outline";
                break;
              case "ActivityTab":
                iconName = "calendar-outline";
                break;
              case "More":
                iconName = "dots-horizontal";
                break;
              default:
                iconName = "circle";
                break;
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="ActivityTab"
          component={ActivityScreen}
          options={{ tabBarLabel: "Activity" }}
        />
        <Tab.Screen
          name="More"
          component={MorePlaceholder}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setModalVisible(true);
            },
          }}
          options={{ tabBarLabel: "More" }}
        />
      </Tab.Navigator>
      <MoreOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        navigation={useNavigation()}
      />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    JosefinSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1D4E89" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
          <AuthProvider>
            <SignUpProvider>
              <QueryClientProvider client={queryClient}>
                <NavigationContainer independent={true}>
                  <Stack.Navigator
                    initialRouteName="Main"
                    screenOptions={{ cardStyle: { flex: 1 } }}
                  >
                    <Stack.Screen
                      name="Main"
                      component={() => (
                        <ProtectedRoutes>
                          <MainTabs />
                        </ProtectedRoutes>
                      )}
                      options={{ headerShown: false }}
                    />

                    <Stack.Screen
                      name="Login"
                      component={LoginScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp1"
                      component={SignUpScreen1}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp2"
                      component={SignUpScreen2}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp3"
                      component={SignUpScreen3}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp4"
                      component={SignUpScreen4}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp5"
                      component={SignUpScreen5}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp6"
                      component={SignUpScreen6}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="SignUp7"
                      component={SignUpScreen7}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="Help"
                      component={HelpScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="Settings"
                      component={SettingsScreen}
                      options={{ headerShown: false }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </QueryClientProvider>
            </SignUpProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
