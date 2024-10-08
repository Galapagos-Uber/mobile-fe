import api from "./index";
import { jwtDecode } from "jwt-decode";
import { DriverResponseDto } from "./DriverService";
import { RiderResponseDto } from "./RiderService";
import { VehicleResponseDto } from "./VehicleService";

export type UserResponseDto = RiderResponseDto | DriverResponseDto;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: "Male" | "Female" | "Others";
  avatarResourcePath: string;
  isActive: string;
  preferredPaymentMethod?: "Credit Card" | "PayPal" | "Cash";
  vehicleDetails?: VehicleResponseDto;
}
export const getUserProfile = async (
  userId: string,
  role: "rider" | "driver"
): Promise<User> => {
  try {
    const endpoint =
      role === "rider" ? `/riders/${userId}` : `/drivers/${userId}`;
    const response = await api.get<DriverResponseDto | RiderResponseDto>(
      endpoint
    );

    if (role === "driver") {
      const driverData = response.data as DriverResponseDto;
      return {
        ...driverData,
        vehicleDetails: driverData.vehicleDetails, // Include vehicle details if available
      } as User; // Adjust to match the `User` type or create a more specific type
    }

    return response.data as User;
  } catch (error) {
    throw new Error("Failed to fetch user profile");
  }
};
