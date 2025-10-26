export interface User {
    _id:             string;
    email:           string;
    profileImageUrl: string;
    isEmailVerified: boolean;
    name:            string;
    phoneNumber:     string;
    isActive:        boolean;
    roles:           string[];
  }