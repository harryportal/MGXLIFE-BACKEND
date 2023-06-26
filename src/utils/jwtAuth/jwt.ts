import * as bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { InternalServerError } from "../../common/error";
import { AuthError } from "../../common/error";
import { Admin, Distributor } from "@prisma/client";
import { jwtPayload } from "../../modules/auth/auth.interface";

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};

export const comparePassword = (password: string, hash:string) => {

  return bcrypt.compare(password, hash);
};

const secret: string | undefined = process.env.JWT_SECRET;

if(!secret) { throw new InternalServerError("JWT SECRET HAS NO VALUE!")}


export const createAcessToken = (user: Distributor) => {

  const token = jwt.sign({ id: user.id, email: user.email, refferalId:user.referringId, firstName:user.firstName, lastName:user.lastName, 
  type:"access"}, secret, { expiresIn: process.env.JWT_EXPIRATION_TIME });

  return token;
};

export const createRefreshToken = (user:Distributor) =>{

  const token = jwt.sign({ id:user.id, email:user.email,type: "refresh"}, secret, {
    expiresIn: process.env.REFRESHTOKEN_EXPIRATION_TIME,
  });
  
  return token;
}

export const createVerificationToken = (email:string)=>{
  const token = jwt.sign({ email, type: "verify"}, secret );
  return token;
}

export const createAdminToken = (admin:Admin)=>{
  const token = jwt.sign({ id: admin.id, email: admin.email, firstname:admin.firstName,
    lastname:admin.lastName, type:"admin"}, secret, { expiresIn: process.env.ADMIN_JWT_EXPIRATION_TIME });

  return token;
};

export const verifyJWT = (token: string): jwtPayload=>{
  
  try {
    const payload = jwt.verify(token, secret);
    return payload as jwtPayload;

  } catch (e) {
    throw new AuthError('Invalid Token Provided');
  }
}

