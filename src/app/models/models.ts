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

export interface Trailer {
  id: number;
  brand: string;
  model: string;
  registrationNumber: string;
  loadCapacity: number;
  pricePerDay: number;
  status: string;
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
  createdAt: string;
}
