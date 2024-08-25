import zxcvbn from "zxcvbn";
import type { PasswordStrength } from "$lib/types";

export function generatePassword(length: number = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>,.?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const result = zxcvbn(password);
  return {
    score: result.score,
    feedback: result.feedback.warning || result.feedback.suggestions[0] || "",
  };
}
