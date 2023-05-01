import * as bcrypt from "bcrypt";
import jwt, { Secret } from 'jsonwebtoken';
import { InternalServerError } from "../../common/error";
import { User } from "@prisma/client";
import { AuthError } from "../../common/error";
import { userPayload } from "../../modules/auth/auth.interface";

const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};

const comparePassword = (password: string, hash:string) => {

  return bcrypt.compare(password, hash);
};


const secret: string | undefined = process.env.JWT_SECRET;

if(!secret) { throw new InternalServerError("JWT SECRET HAS NO VALUE!")}


const createAcessToken = (user: User, activeStatus = true) => {

  const token = jwt.sign({ id: user.id, email: user.email, fullname:user.fullname, 
    activeStatus,type:"access"}, secret, { expiresIn: process.env.JWT_EXPIRATION_TIME });

  return token;
};

const createRefreshToken = (userId:string, activeStatus = true) =>{

  const token = jwt.sign({ id:userId, type: "refresh", activeStatus }, secret, {
    expiresIn: process.env.REFRESHTOKEN_EXPIRATION_TIME,
  });
  
  return token;
}

const verifyJWT = (token: string): userPayload=>{
  
  try {
    const payload = jwt.verify(token, secret);
    return payload as userPayload;

  } catch (e) {
    throw new AuthError('Invalid Token Provided');
  }
}

export { createAcessToken, createRefreshToken, comparePassword, hashPassword, verifyJWT };
