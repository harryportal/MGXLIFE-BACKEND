import * as bcrypt from "bcrypt";
import jwt, { Secret } from 'jsonwebtoken';
import { InternalServerError } from "../../common/error";
import { AuthError } from "../../common/error";
import { distributorPayload } from "../../modules/auth/auth.interface";
import { Distributor } from "@prisma/client";

const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};

const comparePassword = (password: string, hash:string) => {

  return bcrypt.compare(password, hash);
};


const secret: string | undefined = process.env.JWT_SECRET;

if(!secret) { throw new InternalServerError("JWT SECRET HAS NO VALUE!")}


const createAcessToken = (user: Distributor, activeStatus = true) => {

  const token = jwt.sign({ id: user.id, email: user.email, firstName:user.firstName, lastName:user.lastName, 
    activeStatus,type:"access"}, secret, { expiresIn: process.env.JWT_EXPIRATION_TIME });

  return token;
};

const createRefreshToken = (userId:string, activeStatus = true) =>{

  const token = jwt.sign({ id:userId, type: "refresh", activeStatus }, secret, {
    expiresIn: process.env.REFRESHTOKEN_EXPIRATION_TIME,
  });
  
  return token;
}

const verifyJWT = (token: string): distributorPayload=>{
  
  try {
    const payload = jwt.verify(token, secret);
    return payload as distributorPayload

  } catch (e) {
    throw new AuthError('Invalid Token Provided');
  }
}

export { createAcessToken, createRefreshToken, comparePassword, hashPassword, verifyJWT };
