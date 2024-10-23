import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FindAllBlogsDto } from '../comment/dto/create-comment.dto';
import { Tag } from '@prisma/client';
@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  @ApiQuery({type :FindAllBlogsDto})
  findAll(@Query() query) {
    return this.blogService.findAll({...query});
  }

  @Get(':userId/user')
  @ApiQuery({type :FindAllBlogsDto})
  findAllWithUserId(@Query() query,@Param('userId') userId:string) {
    return this.blogService.findAllWithUserId({...query},userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
