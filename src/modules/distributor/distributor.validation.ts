import { IsString } from "class-validator"

export class UpdateProfile {
    @IsString()
    firstname:string
    
    @IsString()
    lastname:string
}