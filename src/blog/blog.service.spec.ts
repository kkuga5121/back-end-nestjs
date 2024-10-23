import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { FindAllBlogsDto } from '../comment/dto/create-comment.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BlogService', () => {
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
      providers: [BlogService, PrismaService],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prismaService = module.get<PrismaService>(PrismaService);
    // Connect Prisma
    await prismaService.$connect();

    // Clean up before tests
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
    await prismaService.blog.deleteMany({});
    await prismaService.user.deleteMany({});

    // Disconnect Prisma
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog with valid data', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog Title',
        content: 'Test Blog Content',
        community: 'HISTORY',
        userId: (await prismaService.user.findFirst()).id,
      };

      const result = await service.create(createBlogDto);

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

      await expect(service.create(createBlogDto as CreateBlogDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should fetch all blogs', async () => {
      const findAllBlogsDto: FindAllBlogsDto = { page: 1, limit: 10 };
      const result = await service.findAll(findAllBlogsDto);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.page).toEqual(1);
      expect(result.limit).toEqual(10);
    });
  });

  describe('findOne',() => {
    it('should fetch a single blog by ID', async () => {
      const blog = await prismaService.blog.findFirst();
      const result = await service.findOne(blog.id);

      expect(result.data).toBeDefined();
      expect(result.data.id).toEqual(blog.id);
    });

    it('should throw NotFoundException for non-existing blog', async () => {
      await expect(await service.findOne('non-existing-id')).toEqual({data:null});
    });
  });
  describe('update', () => {
    it('should update a blog with valid data', async () => {
      const blog = await prismaService.blog.findFirst();
      const updateData = { title: 'Updated Title', content: 'Updated Content' };

      const result = await service.update(blog.id, updateData);

      expect(result.data).toBeDefined();
      expect(result.data.title).toEqual(updateData.title);
      expect(result.data.content).toEqual(updateData.content);
    });

    it('should throw an error if title or content is missing', async () => {
      const blog = await prismaService.blog.findFirst();
      const updateData = { title: '', content: '' };

      await expect(service.update(blog.id, updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a blog', async () => {
      const blog = await prismaService.blog.findFirst();

      const result = await service.remove(blog.id);

      expect(result.data).toBeDefined();
      expect(result.data.id).toEqual(blog.id);

      // Verify blog is deleted
      const deletedBlog = await prismaService.blog.findUnique({ where: { id: blog.id } });
      expect(deletedBlog).toBeNull();
    });

    it('should throw NotFoundException for non-existing blog deletion', async () => {
      await expect(service.remove('non-existing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
