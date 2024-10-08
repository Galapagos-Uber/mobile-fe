import api from "./index";
import { AxiosResponse } from "axios";

export interface RiderResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  avatarResourcePath: string;
  isActive: string;
  preferredPaymentMethod?: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateRiderRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dob: string;
  gender?: string;
  avatarResourcePath?: string;
  isActive: string;
  preferredPaymentMethod?: string;
}

export const getRiders = async (): Promise<
  AxiosResponse<RiderResponseDto[]>
> => {
  return api.get("/riders");
};

export const getRiderById = async (
  id: string
): Promise<AxiosResponse<RiderResponseDto>> => {
  return api.get(`/riders/${id}`);
};

export const createRider = async (
  data: CreateRiderRequestDto
): Promise<AxiosResponse<RiderResponseDto>> => {
  return api.post("/riders", data);
};

export const updateRider = async (
  id: string,
  data: any
): Promise<AxiosResponse<RiderResponseDto>> => {
  return api.put(`/riders/${id}`, data);
};

export const deleteRider = async (id: string): Promise<void> => {
  return api.delete(`/riders/${id}`);
};
