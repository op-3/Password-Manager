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
