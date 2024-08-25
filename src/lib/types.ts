export interface PasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string;
  category: string;
  lastUpdated: string;
}
export interface PasswordStrength {
  score: number;
  feedback: string;
}

export interface TwoFactorAccount {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  type: "TOTP" | "HOTP" | "STEAM";
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  period: number;
}
