import api from "./index";
import { AxiosResponse } from "axios";

export interface VehicleResponseDto {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  carType: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateVehicleRequestDto {
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  carType: string;
}

export const getVehicles = async (): Promise<
  AxiosResponse<VehicleResponseDto[]>
> => {
  return api.get("/vehicles");
};

export const getVehicleById = async (
  id: string
): Promise<AxiosResponse<VehicleResponseDto>> => {
  return api.get(`/vehicles/${id}`);
};

export const createVehicle = async (
  data: CreateVehicleRequestDto
): Promise<AxiosResponse<VehicleResponseDto>> => {
  return api.post("/vehicles", data);
};

export const updateVehicle = async (
  id: string,
  data: any
): Promise<AxiosResponse<VehicleResponseDto>> => {
  return api.put(`/vehicles/${id}`, data);
};

export const deleteVehicle = async (id: string): Promise<void> => {
  return api.delete(`/vehicles/${id}`);
};
