import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty({description:'Username',default:'user'})
    @IsString()
    username: string;
}
