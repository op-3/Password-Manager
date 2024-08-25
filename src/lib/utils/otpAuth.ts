import * as OTPAuth from "otpauth";
import type { TwoFactorAccount } from "$lib/types/twoFactor";

export function generateTotp(account: TwoFactorAccount): string {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(account.secret),
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
  });
  return totp.generate();
}

export function parseOtpAuthUri(uri: string): Partial<TwoFactorAccount> | null {
  try {
    const url = new URL(uri);
    const params = new URLSearchParams(url.search);

    const [type, account] = url.pathname.slice(1).split(":");
    const [issuer, name] = account ? account.split(":") : [null, account];

    return {
      name: name || params.get("account") || "",
      issuer: issuer || params.get("issuer") || "",
      secret: params.get("secret") || "",
      type: (type.toUpperCase() as "TOTP" | "HOTP" | "STEAM") || "TOTP",
      algorithm:
        (params.get("algorithm") as "SHA1" | "SHA256" | "SHA512") || "SHA1",
      digits: parseInt(params.get("digits") || "6", 10),
      period: parseInt(params.get("period") || "30", 10),
    };
  } catch (error) {
    console.error("Failed to parse OTP Auth URI:", error);
    return null;
  }
}
