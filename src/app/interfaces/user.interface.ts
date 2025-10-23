export interface User {
    _id:             string;
    email:           string;
    isEmailVerified: boolean;
    name:            string;
    phoneNumber:     string;
    isActive:        boolean;
    roles:           string[];
  }