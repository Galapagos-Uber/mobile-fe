import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";

export type RootStackParamList = {
  Login: undefined;
  SignUp1: undefined;
  SignUp2: undefined;
  SignUp3: undefined;
  SignUp4: undefined;
  SignUp5: undefined;
  SignUp6: undefined;
  SignUp7: undefined;
  Home: undefined;
  Help: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Activity: undefined;
  More: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
