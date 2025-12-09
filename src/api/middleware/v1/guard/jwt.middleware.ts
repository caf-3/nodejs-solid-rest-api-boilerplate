import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CryptographyUtils from '../../../../utils/Cryptography.util';
import { UserSessionRepository } from '../../../../repositories/implementations/UserSessionRepository';

const JWT_SECRET = process.env.JWT_SECRET || '';
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || '';
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || '';

const userSessionRepository = new UserSessionRepository();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        is_admin?: boolean;
    };
}

export const jwtDecoder = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const statusCode = 401;
        const authHeaders = req.headers.authorization;

        if (!authHeaders) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Erro na autenticação',
                data: [],
            });
            return;
        }

        const parts = authHeaders.split(' ');

        if (parts.length !== 2) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Erro na autenticação',
                data: [],
            });
            return;
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Autenticação malformatada',
                data: [],
            });
            return;
        }

        const tokenFinal = CryptographyUtils.decryptToken(token);

        if (tokenFinal === null) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Autenticação inválida',
                data: [],
            });
            return;
        }

        // Verify JWT token
        try {
            const decoded = jwt.verify(tokenFinal, JWT_SECRET) as any;
            
            // Check if session is active
            const session = await userSessionRepository.findByToken(token);
            if (!session || !session.is_active || session.logged_out_at) {
                res.status(statusCode).json({
                    error: true,
                    status: statusCode,
                    message: 'Sessão inválida ou expirada',
                    data: [],
                });
                return;
            }
            
            // Add user info to request
            req.user = {
                id: decoded.userId || decoded.id,
                email: decoded.email,
                is_admin: decoded.is_admin
            };
            
            next();
        } catch (jwtError: any) {
            console.log('JWT verification error:', jwtError.name);
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Token inválido ou expirado',
                data: [],
            });
            return;
        }
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        console.error('JWT Decoder Error:', error);
        res.status(statusCode).json({
            error: true,
            status: statusCode,
            message: 'Erro interno do servidor',
            data: [],
        });
    }
};

export const basicAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const statusCode = 401;
        const authHeaders = req.headers.authorization;

        if (!authHeaders) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Erro na autenticação',
                data: [],
            });
            return;
        }

        const parts = Buffer.from(authHeaders.split(' ')[1], 'base64').toString().split(':');
        const username = parts[0];
        const password = parts[1];

        if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
            next();
        } else {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Erro na autenticação',
                data: [],
            });
        }
    } catch (error: any) {
        console.log({ error });
        const statusCode = 500;
        res.status(statusCode).json({
            error: true,
            status: statusCode,
            message: 'Erro interno do servidor',
            data: [],
        });
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const statusCode = 401;
        const authHeaders = req.headers.authorization;

        if (!authHeaders) {
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: 'Erro na autenticação',
                data: [],
            });
            return;
        }

        // Primeiramente tenta verificar Bearer Token
        const parts = authHeaders.split(' ');

        if (parts.length === 2) {
            const [scheme, token] = parts;

            if (/^Bearer$/i.test(scheme)) {
                const tokenFinal = CryptographyUtils.decryptToken(token);

                if (tokenFinal === null) {
                    res.status(statusCode).json({
                        error: true,
                        status: statusCode,
                        message: 'Autenticação inválida',
                        data: [],
                    });
                    return;
                }

                jwt.verify(tokenFinal, JWT_SECRET, async (err, decoded) => {
                    if (err) {
                        return res.status(statusCode).json({
                            error: true,
                            status: statusCode,
                            message: 'Autenticação inválida',
                            data: [],
                        });
                    }

                    // Check if session is active
                    const session = await userSessionRepository.findByToken(token);
                    if (!session || !session.is_active || session.logged_out_at) {
                        return res.status(statusCode).json({
                            error: true,
                            status: statusCode,
                            message: 'Sessão inválida ou expirada',
                            data: [],
                        });
                    }

                    const decodedData = decoded as any;
                    const _req = req as any;
                    _req._user = { id: decodedData.userId, is_admin: decodedData.is_admin };
                    return next();
                });
            }
        }

        // Se não for Bearer, tenta verificar Basic Auth
        const basicAuthParts = Buffer.from(authHeaders.split(' ')[1], 'base64')
            .toString()
            .split(':');
        const username = basicAuthParts[0];
        const password = basicAuthParts[1];

        if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
            return next();
        }

        // Caso contrário, retornar erro de autenticação
        res.status(statusCode).json({
            error: true,
            status: statusCode,
            message: 'Erro na autenticação',
            data: [],
        });
    } catch (error: any) {
        const statusCode = 500;
        res.status(statusCode).json({
            error: true,
            status: statusCode,
            message: 'Erro interno do servidor',
            data: [],
        });
    }
};
