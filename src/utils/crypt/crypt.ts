export interface Crypt {
  encrypt(data: string, hexKey: string): string;
  decrypt(cipherText: string, hexKey: string): string;
}
