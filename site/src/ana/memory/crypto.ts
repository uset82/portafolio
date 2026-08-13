import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { encryptedBlobSchema, type EncryptedBlob } from "./schemas";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

export const assertMemoryKey = (key: Buffer): Buffer => {
  if (key.length !== KEY_LENGTH) {
    throw new Error("ANA memory key must be 32 bytes.");
  }
  return key;
};

export const memoryKeyFromEnv = (env: Record<string, string | undefined> = process.env): Buffer => {
  const hex = env.ANA_MEMORY_KEY?.trim() ?? "";
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) {
    throw new Error("ANA_MEMORY_KEY must be 32 bytes as 64 hex characters.");
  }
  return assertMemoryKey(Buffer.from(hex, "hex"));
};

export const encryptJson = (value: unknown, key: Buffer, aad: string): EncryptedBlob => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, assertMemoryKey(key), iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    v: 1,
    alg: ALGORITHM,
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    data: encrypted.toString("hex"),
  };
};

export const decryptJson = <T>(blob: EncryptedBlob, key: Buffer, aad: string): T => {
  const parsed = encryptedBlobSchema.parse(blob);
  const decipher = createDecipheriv(ALGORITHM, assertMemoryKey(key), Buffer.from(parsed.iv, "hex"));
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as T;
};
