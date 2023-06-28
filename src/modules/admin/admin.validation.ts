import { IsString } from "class-validator";

export class UpdateProfile {
    @IsString()
    firstName:string

    @IsString()
    lastname:string
    
}