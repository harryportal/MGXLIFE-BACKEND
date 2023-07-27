import { IsEmail, IsOptional, IsString } from "class-validator"

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstname:string
    
    @IsOptional()
    @IsString()
    lastname:string
}

export class ComplaintDto {
    @IsEmail()
    email:string;
    
    @IsEmail()
    fullname:string;

    @IsEmail()
    message:string
}