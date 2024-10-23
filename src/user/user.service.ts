import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { tr } from '@faker-js/faker/.';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prismaService.user.create({
        data: createUserDto,
      });
      return { data: user };
    } catch (error) {
      console.error('Error creating user:', error);
      // if (error.code === 'P2002') { // Prisma unique constraint violation
      //   throw new NotFoundException('User with the provided details already exists.');
      // }
      throw new BadRequestException('Failed to create user.');
    }
  }

  async findAll() {
    try {
      const users = await this.prismaService.user.findMany({
        orderBy: {
          id: 'desc',
        },
      });
      return { data: users };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException('Failed to fetch users.');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },include:{
          blogs:true
        }
      });
      return { data: user };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new BadRequestException('Failed to fetch user.');
    }
  }
 async findOneByUsername(username:string){
  try {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      include:{
        blogs:true
      },
    });
    return { data: user };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new BadRequestException('Failed to fetch user.');
  }
 }
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });
      return { data: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      // if (error.code === 'P2025') { // Prisma record not found
      //   throw new NotFoundException(`User with ID ${id} not found.`);
      // }
      throw new BadRequestException('Failed to update user.');
    }
  }

  async remove(id: string) {
    try {
      // Delete related comments first
      await this.prismaService.comment.deleteMany({
        where: {
          OR: [{ userId: id }, { blog: { userId: id } }],
        },
      });

      // Delete related blogs
      await this.prismaService.blog.deleteMany({
        where: { userId: id },
      });

      // Delete the user
      const user = await this.prismaService.user.delete({
        where: { id },
      });
      return { data: user };
    } catch (error) {
      console.error('Error deleting user:', error);
      // if (error.code === 'P2025') { // Prisma record not found
      //   throw new NotFoundException(`User with ID ${id} not found.`);
      // }
      throw new BadRequestException('Failed to delete user.');
    }
  }
}
