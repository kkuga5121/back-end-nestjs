import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllBlogsDto } from '../comment/dto/create-comment.dto';
import { tr } from '@faker-js/faker/.';

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBlogDto: CreateBlogDto) {
    // Check if title and content are provided
    if (!createBlogDto.title || !createBlogDto.content) {
      throw new BadRequestException('Title and content are required');
    }

    try {
      const blog = await this.prismaService.blog.create({
        data: { ...createBlogDto },
      });
      return { data: blog };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw new BadRequestException('Failed to create blog');
    }
  }

  async findAll(findAllBlogsDto: FindAllBlogsDto) {
    const { tag, page =1, limit=10 } = findAllBlogsDto;
    const skip:number = (page - 1) * Number(limit);

    //set filter Community if Tag do not null
    const filter: any = {};
    if (tag) {
      filter.community = tag;
    }

    try {
      //get total record of table
      const total = await this.prismaService.blog.count({ where: filter });
      const blogs = await this.prismaService.blog.findMany({
        where: filter,
        skip:skip,
        take: Number(limit),
        include:{
          user:true,
         _count:{
          select:{comments:true}
         }
        },
        orderBy: { createdAt: 'desc' },
      });

      // const formattedPosts = blogs.map((post) => ({
      //   id: post.id,
      //   title: post.title,
      //   content: post.content,
      //   community: post.community,
      //   user: post.user,
      //   commentCount:post._count.comments
      // }));

      return {
        total,
        page,
        limit,
        data: blogs,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new BadRequestException('Failed to fetch blogs');
    }
  }
  async findAllWithUserId(findAllBlogsDto: FindAllBlogsDto,userId:string) {
    const { tag, page = 1, limit = 10 } = findAllBlogsDto;
    const skip = (page - 1) * Number(limit);

    const filter: any = {};
    if (tag) {
      filter.community = tag;
    }
    filter.userId = userId;
    try {
      const total = await this.prismaService.blog.count({ where: filter });
      const blogs = await this.prismaService.blog.findMany({
        where: filter,
        skip:skip,
        take: Number(limit),
        include:{
          user:true,
         _count:{
          select:{comments:true}
         }
        },
        orderBy: { createdAt: 'desc' },
      });

      // const formattedPosts = blogs.map((post) => ({
      //   id: post.id,
      //   title: post.title,
      //   content: post.content,
      //   community: post.community,
      //   user: post.user,
      //   commentCount:post._count.comments
      // }));

      return {
        total,
        page,
        limit,
        data: blogs,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new BadRequestException('Failed to fetch blogs');
    }
  }

  async findOne(id: string) {
    try {
      const blog = await this.prismaService.blog.findUnique({
         where: { id },
         include:{
          comments :{
            include:{user:true}
          },
          user:true,
          _count:{
           select:{comments:true}
          }}
      });
      
      return { data: blog };
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw new BadRequestException('Failed to find the blog');
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    if (!updateBlogDto.title || !updateBlogDto.content) {
      throw new BadRequestException('Title and content are required');
    }

    try {
      const update = await this.prismaService.blog.update({
        where: { id },
        data: { ...updateBlogDto },
      });
      return { data: update };
    } catch (error) {
      console.error('Error updating blog:', error);
      throw new BadRequestException('Failed to update blog');
    }
  }

  async remove(id: string) {
    try {
      // Delete associated comments first
      await this.prismaService.comment.deleteMany({
        where: { blogId: id },
      });

      const blog = await this.prismaService.blog.delete({
        where: { id },
      });

      return { data: blog };
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw new NotFoundException('Failed to delete blog');
    }
  }
}
