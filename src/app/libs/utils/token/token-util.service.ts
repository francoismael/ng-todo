import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    exp: number;
    iat: number;
    userId: string;
    username: string;
    roles: string[];
}

export class TokenUtilService {
    static isTokenExpired(token: string): boolean {
        if (!token) {
            return true;
        }

        try {
            const decoded: JWTPayload = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = decoded.exp < currentTime;
            return isExpired;
        } catch (error) {
            console.error('Token invalide ou erreur de décodage :', error);
            return true;
        }
    }
}
