import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.dto';
import { AuthError } from '../../common/error';
import { verifyJWT } from '../../utils/jwtAuth/jwt';


export const adminProtect = (req: AuthRequest, res: Response, next: NextFunction)=> {
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

    if(payload.type != "admin") { 
      throw new AuthError("Token cannot be used for Admin Authentication!")
    }

    req.user = payload;
    next();
};
