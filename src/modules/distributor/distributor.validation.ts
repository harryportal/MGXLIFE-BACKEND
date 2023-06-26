import { IsOptional, IsString } from "class-validator"

export class UpdateProfile {
    @IsOptional()
    @IsString()
    firstname:string
    
    @IsOptional()
    @IsString()
    lastname:string
}

