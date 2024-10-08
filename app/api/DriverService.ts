import api from "./index";
import { AxiosResponse } from "axios";
import { VehicleResponseDto } from "./VehicleService";

export interface DriverResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  avatarResourcePath: string;
  isActive: string;
  licenseNumber: string;
  vehicleDetails: VehicleResponseDto;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateDriverRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  avatarResourcePath?: string;
  isActive: string;
  licenseNumber: string;
  vehicleDetails?: any;
}

export const getDrivers = async (): Promise<
  AxiosResponse<DriverResponseDto[]>
> => {
  return api.get("/drivers");
};

export const getDriverById = async (
  id: string
): Promise<AxiosResponse<DriverResponseDto>> => {
  return api.get(`/drivers/${id}`);
};

export const createDriver = async (
  data: CreateDriverRequestDto
): Promise<AxiosResponse<DriverResponseDto>> => {
  return api.post("/drivers", data);
};

export const updateDriver = async (
  id: string,
  data: any
): Promise<AxiosResponse<DriverResponseDto>> => {
  return api.put(`/drivers/${id}`, data);
};

export const deleteDriver = async (id: string): Promise<void> => {
  return api.delete(`/drivers/${id}`);
};
