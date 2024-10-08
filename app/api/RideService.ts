import { DriverResponseDto } from "./DriverService";
import api from "./index";
import { AxiosResponse } from "axios";
import { RiderResponseDto } from "./RiderService";

export interface RideResponseDto {
  id: string;
  rider: RiderResponseDto;
  driver: DriverResponseDto;
  // vehicle: DriverResponseDto;
  startLocation: string;
  endLocation: string;
  pickupTime: string;
  dropoffTime: string;
  fare: number;
  distance: number;
  status: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateRideRequestDto {
  riderId: string;
  startLocation: string;
  endLocation: string;
}

export const getRides = async (): Promise<AxiosResponse<RideResponseDto[]>> => {
  return api.get("/rides");
};

export const getRideById = async (
  id: string
): Promise<AxiosResponse<RideResponseDto>> => {
  return api.get(`/rides/${id}`);
};

export const createRide = async (
  data: CreateRideRequestDto
): Promise<AxiosResponse<RideResponseDto>> => {
  return api.post("/rides", data);
};

export const updateRide = async (
  id: string,
  data: any
): Promise<AxiosResponse<RideResponseDto>> => {
  return api.put(`/rides/${id}`, data);
};

export const deleteRide = async (id: string): Promise<void> => {
  return api.delete(`/rides/${id}`);
};

export const getRidesByRiderId = async (
  riderId: string
): Promise<AxiosResponse<RideResponseDto[]>> => {
  return api.get(`/rides/rider/${riderId}`);
};

export const getRidesByDriverId = async (
  driverId: string
): Promise<AxiosResponse<RideResponseDto[]>> => {
  return api.get(`/rides/driver/${driverId}`);
};
