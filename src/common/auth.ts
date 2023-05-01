import { Response, NextFunction } from 'express';
import { AuthRequest }from '../modules/auth/auth.interface';
import { AuthError } from './error';
import { verifyJWT } from '../utils/jwtAuth/jwt';


export const protect = (checkActiveStatus = true) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
      throw new AuthError('No Authentication Provided');
    }

    const [, token] = bearer.split(' '); // destructuring
    if (!token) {
      throw new AuthError('Bearer has no token');
    }

    const payload = verifyJWT(token);

    // This prevents the client from using the refresh token for authentication

    if(payload.type == "refresh") { 
      throw new AuthError("Refresh Token cannot be used for Authentication!")
    }

    if (checkActiveStatus && !payload.activeStatus) {
      throw new AuthError('User Account not activated!');
    }
    req.user = payload;
    next();
  };
};