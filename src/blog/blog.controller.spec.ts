import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto, FindAllBlogsDto } from '../comment/dto/create-comment.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Tag } from '@prisma/client';
import exp from 'constants';

describe('BlogController', () => {
  let controller: BlogController;
  let service: BlogService;
  let prismaService: PrismaService;
  let spy: jest.SpyInstance;
  beforeEach(() => {
    //Do not show error message
    spy = jest.spyOn(console, 'error').mockImplementation(() => null);
  });
  afterEach(() => {
    spy.mockRestore();
  });
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [BlogService, PrismaService],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get<BlogService>(BlogService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Connect Prisma
    await prismaService.$connect();

    // Clean up before tests
    await prismaService.comment.deleteMany({});
    await prismaService.blog.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create a test user
    await prismaService.user.create({
      data: {
        username: 'blog_user',
      },
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await prismaService.comment.deleteMany({});
    await prismaService.blog.deleteMany({});
    await prismaService.user.deleteMany({});

    // Disconnect Prisma
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Blog', () => {
    it('should create a blog with valid data', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog Title',
        content: 'Test Blog Content',
        community: 'HISTORY',
        userId: (await prismaService.user.findFirst()).id,
      };

      const result = await controller.create(createBlogDto);

      expect(result.data).toBeDefined();
      expect(result.data.title).toEqual(createBlogDto.title);
      expect(result.data.content).toEqual(createBlogDto.content);
    });

    it('should throw an error if title or content is missing', async () => {
      const createBlogDto: Partial<CreateBlogDto> = {
        title: '',
        content: '',
        community: 'HISTORY',
        userId: (await prismaService.user.findFirst()).id,
      };

      await expect(controller.create(createBlogDto as CreateBlogDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Fetch Blogs', () => {
    it('should fetch all blogs', async () => {
      const findAllBlogsDto: FindAllBlogsDto = { page: 1, limit: 10 };
      const result = await controller.findAll(findAllBlogsDto);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.page).toEqual(1);
      expect(result.limit).toEqual(10);
    });
    it('should be return Blog with tag',async () =>{
      
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog Title',
        content: 'Test Blog Content',
        community: 'FASHION',
        userId: (await prismaService.user.findFirst()).id,
      };
      //create Fasion Tag
      await controller.create(createBlogDto);
      const findAllBlogsDto: FindAllBlogsDto = { page: 1, limit: 10,tag:Tag.FASHION };
      const result = await controller.findAll(findAllBlogsDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.data.length).toBeLessThanOrEqual(result.total)

    })
    it('should be return Empty List Blog with tag',async () =>{
      
      const findAllBlogsDto: FindAllBlogsDto = { page: 1, limit: 10,tag:Tag.OTHERS };
      const result = await controller.findAll(findAllBlogsDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(0);
      expect(result.data.length).toBeLessThanOrEqual(result.total)

    })
    it('should be return List blog in current page and limit',async () =>{
      
      const findAllBlogsDto: FindAllBlogsDto = { page: 2, limit: 1};
      const result = await controller.findAll(findAllBlogsDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(1);
      expect(result.data.length).toBeLessThanOrEqual(result.total)

    })
  });
  describe('Update Blog', () => {
    it('should throw an error if Id is mistake', async () => {
      const updateData = { title: 'Updated Title', content: 'Updated Content' };
      
      await expect(controller.update('id-mistake', updateData)).rejects.toThrow(BadRequestException);
    })
  });
  describe('Delete Blog', () => {
    it('should delete a blog with relation Comment', async () => {
      const blog = await prismaService.blog.findFirst();
      const createComment:CreateCommentDto ={
        content:'Comment Test',
        blogId:blog.id,
        userId: (await prismaService.user.findFirst()).id,
      }
      const comment = await prismaService.comment.create({
        data:{...createComment}
      })

      const result = await controller.remove(blog.id);

      expect(result.data).toBeDefined();
      expect(result.data.id).toEqual(blog.id);

      // Verify blog is deleted
      const deletedBlog = await prismaService.blog.findUnique({ where: { id: blog.id } });
      expect(deletedBlog).toBeNull();
      const deleteComment = await prismaService.comment.findMany({where :{blogId:blog.id}})
      expect(deletedBlog).toBeNull();
    });
  });
});
