export interface AuthToken {
  token: string;
  businessId: string;
  billerCode?: string;
}

export interface Business {
  businessId: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  billerCode: string;
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    businessId: string;
    business: Business;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    token: string;
    businessId: string;
    billerCode: string;
    business: Business;
  };
  message: string;
}
