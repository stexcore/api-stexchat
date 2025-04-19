import forge from "node-forge";

export default {
    /**
     * Encrypt data using a public key
     * @param publicKey PEM-formatted public key
     * @param data Data to encrypt (string)
     * @returns Base64-encoded encrypted data
     */
    encryptWithPublicKey(publicKey: string, data: string): string {
        // Convert PEM-formatted public key to a forge public key object
        const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);

        // Encrypt the data using the public key
        const encrypted = forgePublicKey.encrypt(data, "RSA-OAEP", {
            md: forge.md.sha256.create(), // Hashing algorithm
        });

        // Return the encrypted data as a Base64 string
        return forge.util.encode64(encrypted);
    },

    /**
     * Decrypt data using a private key
     * @param privateKey PEM-formatted private key
     * @param encryptedData Base64-encoded encrypted data
     * @returns Decrypted data as a string
     */
    decryptWithPrivateKey(privateKey: string, encryptedData: string): string {
        // Convert PEM-formatted private key to a forge private key object
        const forgePrivateKey = forge.pki.privateKeyFromPem(privateKey);

        // Decode the Base64-encoded encrypted data
        const encryptedBytes = forge.util.decode64(encryptedData);

        // Decrypt the data using the private key
        const decrypted = forgePrivateKey.decrypt(encryptedBytes, "RSA-OAEP", {
            md: forge.md.sha256.create(), // Hashing algorithm
        });

        return decrypted; // Return the decrypted data as a string
    },
};
