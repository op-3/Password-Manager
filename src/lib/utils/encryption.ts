import CryptoJS from "crypto-js";
import { invoke } from "@tauri-apps/api/tauri";

const KEY_SIZE = 256 / 32;
const ITERATIONS = 1000;

let SALT: string | null = null;

async function getSalt(): Promise<string> {
  if (!SALT) {
    SALT = localStorage.getItem("encryption_salt");
    if (!SALT) {
      SALT = await invoke("generate_salt");
      localStorage.setItem("encryption_salt", SALT);
    }
  }
  return SALT;
}

export async function encrypt(data: string, password: string): Promise<string> {
  const salt = await getSalt();
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
  return CryptoJS.AES.encrypt(data, key.toString()).toString();
}

export async function decrypt(
  encryptedData: string,
  password: string
): Promise<string> {
  const salt = await getSalt();
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key.toString());
  return decrypted.toString(CryptoJS.enc.Utf8);
}
