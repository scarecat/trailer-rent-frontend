export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface Trailer {
  id: number;
  brand: string;
  model: string;
  registrationNumber: string;
  loadCapacity: number;
  pricePerDay: number;
  status: "Dostepna" | "Wypozyczona" | "WSerwisie" | "Wycofana";
  type: string;
  description?: string;
  createdAt: string;
}

export interface Rental {
  id: number;
  trailerId: number;
  trailerInfo: string;
  userId: number;
  userFullName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'Oczekujaca' | 'Zatwierdzona' | 'Odrzucona' | 'Aktywna' | 'Zakonczona' | 'Anulowana';
  createdAt: string;
}

export interface CreateTrailerDto {
   brand: string,
   model: string,
   registrationNumber: string,
   loadCapacity: number,
   pricePerDay: number,
   type: "Cargo" | "Motorboat" | "Flatbed" | "Refrigerated" | "Other"
   description?: string
}

export interface UpdateTrailerDto {
   brand: string,
   model: string,
   registrationNumber: string,
   loadCapacity: number,
   pricePerDay: number,
   status: "Dostepna" | "Wypozyczona" | "WSerwisie" | "Wycofana",
   type: "Cargo" | "Motorboat" | "Flatbed" | "Refrigerated" | "Other",
   description?: string
}



export interface CreateRentalDto {
  trailerId: number;
  startDate: string;
  endDate: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  salary?: number;
  createdAt: string;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  salary: number;
  password?: string;
}
