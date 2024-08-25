import * as OTPAuth from "otpauth";

export function generateTOTP(secret: string): string {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.generate();
}

export function generateHOTP(secret: string, counter: number): string {
  const hotp = new OTPAuth.HOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return hotp.generate({ counter });
}

// TODO: Implement Steam and Blizzard specific generators if needed
