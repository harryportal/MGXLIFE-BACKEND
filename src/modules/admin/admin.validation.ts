import { BonusType } from "@prisma/client";
import { IsString, IsDecimal, IsEnum, IsEmail } from "class-validator";


export class SignIn {
    @IsEmail()
    email:string;

    @IsString()
    password:string;
}


export class UpdateProfile {
    @IsString()
    firstName:string

    @IsString()
    lastName:string
}

export class UpdateProduct{
    @IsEnum(BonusType)
    bonusType:BonusType;

    @IsDecimal()
    bonusAmount:number;
}