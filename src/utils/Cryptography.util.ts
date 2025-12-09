import bcrypt from 'bcrypt';
import Cryptr from 'cryptr';
import { randomBytes } from 'node:crypto';
import ShortUniqueId from 'short-unique-id';
const JWT_SECRET = process.env.JWT_SECRET || '';
import jwt from 'jsonwebtoken';

class CryptographyUtils {
    private cryptr: Cryptr;

    constructor() {
        this.cryptr = new Cryptr(process.env.CRYPT_SECRET as string);
        this.encryptToken = this.encryptToken.bind(this);
    }
    encodeBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }
    decodeBase64(str: string): string {
        return Buffer.from(str, 'base64').toString();
    }
    isUUIDv4(id: string): boolean {
        const regexExp =
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        return regexExp.test(id);
    }
    generateInvoiceRef(length: number): string {
        const uuid = new ShortUniqueId({ length: length });
        return uuid.randomUUID();
    }
    encryptToken(token: string): string {
        return this.cryptr.encrypt(token);
    }
    decryptToken(token: string): string {
        return this.cryptr.decrypt(token);
    }
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    generateHash(len = 26): string {
        return randomBytes(26).toString('hex');
    }
    signJWTToken(payload: object, expiresIn: any): string {
        let accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
        accessToken = this.encryptToken(accessToken);
        return accessToken;
    }
}

export default new CryptographyUtils();
