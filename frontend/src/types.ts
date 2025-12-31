export type CalculationOperation = "add" | "subtract" | "multiply" | "divide";

export interface CalculationRequest {
  a: number;
  b: number;
  operation: CalculationOperation;
}

export interface CalculationResult {
  result: number;
  operation: CalculationOperation;
  operands: {
    a: number;
    b: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  profile_picture: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Session {
  id: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  last_used_at: string;
  user: User;
}

export interface AuthErrorResponse {
  error: string;
  message: string;
  login_url?: string;
}
