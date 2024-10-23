import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "@prisma/client";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCommentDto {
    @ApiProperty({description:'Content of Comment post to blog',default:'Comment'})
    @IsString()
    content: string;
    
    @ApiProperty({description:'User Id Of Commend',default:"id"})
    @IsString()
    userId: string;

    @ApiProperty({description:'Blog Id Of Commend',default:'blogId'})
    @IsString()
    blogId: string;
}
  export class FindAllBlogsDto {
    @ApiProperty({ required: false, description: 'Filter by tag' })
    @IsOptional()
    @IsEnum(Tag) // Ensure that the tag is one of the defined Tag enum values
    tag?: Tag;
  
    @ApiProperty({ required: false, description: 'Page number for pagination', default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;
  
    @ApiProperty({ required: false, description: 'Number of blogs per page', default: 10 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
  }