import { IsEmail, IsString, IsOptional } from "class-validator";


export class SignIn {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class SignUp{
    @IsString()
    firstName: string;
  
    @IsString()
    lastName: string;
  
    @IsEmail()
    email: string;
  
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    referringId:string
  
}

export class ResetPassword {
    @IsString()
    token:string;

    @IsString()
    password: string;

    @IsString()
    confirmPassword: string;

}
