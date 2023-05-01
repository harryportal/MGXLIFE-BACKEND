import { IsString, IsNumber, IsBoolean, IsNumberString, IsBooleanString } from "class-validator";

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