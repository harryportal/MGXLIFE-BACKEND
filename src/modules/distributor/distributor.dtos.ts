import { IsOptional, IsString } from "class-validator"

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstname:string
    
    @IsOptional()
    @IsString()
    lastname:string
}

