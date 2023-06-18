import { IsEmail, IsString, IsOptional, IsNumberString, IsBooleanString } from "class-validator";


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

export class Profile {
    @IsString()
    category: string;

    @IsNumberString()
    businessNo: number;

    @IsString()
    businessCategory: string;

    @IsString()
    businessModel: string;

    @IsNumberString()
    dealSizeMin: number;

    @IsNumberString()
    dealSizeMax: number;

    @IsBooleanString()
    financeRequired: boolean;

    @IsString()
    aboutCompany: string
}

export class ResetPassword {
    @IsString()
    token:string;

    @IsString()
    password: string;

    @IsString()
    confirmPassword: string;

}
