export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
  pronoun: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UserRequest {
  name: string;
  email: string;
  dob: string;
  password: string;
}
