import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateBlogDto {
  @ApiProperty({description:'Title of Blog',default:'Title'})
  @IsNotEmpty({message:'Title do not empty'})
  @IsString()
  title: string;

  @ApiProperty({description:'Content of Blog',default:'Content'})
  @IsNotEmpty({message:'Content do not empty'})
  @IsString()
  content: string;
  
  @ApiProperty({description:'Tag Community of Blog',default:'HISTORY'})
  @IsEnum(Tag)
  community: Tag;
  
  @ApiProperty({description:'User Id of Blog',default:'ID'})
  @IsString()
  userId: string;
}
