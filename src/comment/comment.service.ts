import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCommentDto: CreateCommentDto) {
    
    if (!createCommentDto.content ) {
      throw new BadRequestException('content are required');
    }

    try {
      const create = await this.prismaService.comment.create({
        data: {
          ...createCommentDto,
        },
      });
      return { data: create };
    } catch (e) {
      console.error('Error creating comment:', e);
      throw new BadRequestException('Failed to create comment');
    }
  }

  async findAll() {
    try {
      const comments = await this.prismaService.comment.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { data: comments };
    } catch (e) {
      console.error('Error finding all comments:', e);
      throw new BadRequestException('Failed to fetch comments');
    }
  }

  async findAllByBlog(blogId: string) {
    try {
      const comments = await this.prismaService.comment.findMany({
        where: {
          blogId: blogId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { data: comments };
    } catch (e) {
      console.error('Error finding comments by blog:', e);
      throw new BadRequestException('Failed to fetch comments for the specified blog');
    }
  }

  async findOne(id: string) {
    try {
      const comment = await this.prismaService.comment.findUnique({
        where: {
          id: id,
        },
      });
      return { data: comment };
    } catch (e) {
      console.error('Error finding comment:', e);
      throw new BadRequestException('Failed to fetch comment');
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    if (!updateCommentDto.content ) {
      throw new BadRequestException('content are required');
    }
    try {
      const update = await this.prismaService.comment.update({
        where: {
          id: id,
        },
        data: {
          ...updateCommentDto,
        },
      });
      return { data: update };
    } catch (e) {
      console.error('Error updating comment:', e);
      throw new BadRequestException('Failed to update comment');
    }
  }

  async remove(id: string) {
    try {
      const comment = await this.prismaService.comment.delete({
        where: {
          id: id,
        },
      });
      return { data: comment };
    } catch (e) {
      console.error('Error deleting comment:', e);
      throw new BadRequestException('Failed to delete comment');
    }
  }
}
