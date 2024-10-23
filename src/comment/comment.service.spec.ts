import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { after } from 'node:test';

describe('CommentService', () => {
  let service: CommentService;
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
      providers: [CommentService, PrismaService],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Connect to an in-memory SQLite database
    prismaService.$connect();

    // Reset the database before running test
    await prismaService.comment.deleteMany({});
    await prismaService.blog.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create a test user
    await prismaService.user.create({
      data: {
        id: 'test-user-id',
        username: 'blog_user',
      },
    });

    // Create a test blog
    await prismaService.blog.create({
      data: {
        id: 'test-blog-id',
        title: 'Test Blog',
        community:'FOOD',
        content: 'Test content',
        userId: 'test-user-id',
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
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto = {
        content: 'Test comment',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };

      const result = await service.create(createCommentDto);
      expect(result).toHaveProperty('data');
      expect(result.data).toBeDefined()
      expect(result.data.content).toEqual(createCommentDto.content)

      // Verify in the database
      const createdComment = await prismaService.comment.findUnique({
        where: { id: result.data.id },
      });
      expect(createdComment).not.toBeNull();
      expect(createdComment.content).toBe('Test comment');
    });

    it('should throw BadRequestException if creation fails', async () => {
      const createCommentDto = {
        content: 'Test comment',
        blogId: 'non-existent-blog-id', // Invalid blog ID
        userId: 'test-user-id',
      };

      await expect(service.create(createCommentDto)).rejects.toThrow(BadRequestException);
    });
    
    it('should create with emtry content', async () => {
      const createCommentDto = {
        content: '',
        blogId: 'non-existent-blog-id', // Invalid blog ID
        userId: 'test-user-id',
      };

      await expect(service.create(createCommentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const mockComment1 = {
        content: 'First comment',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };
      const mockComment2 = {
        content: 'Second comment',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };

      await service.create(mockComment1);
      await service.create(mockComment2);

      const result = await service.findAll();
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });

  });

  describe('findOne', () => {
    it('should return a specific comment', async () => {
      const blog = await prismaService.blog.findFirst();
      const user = await prismaService.user.findFirst();
      const createCommentDto = {
        content: 'A specific comment',
        blogId: blog.id,
        userId: user.id,
      };

      const commant = await service.create(createCommentDto);

      const result = await service.findOne(commant.data.id);
      expect(result.data).toMatchObject(createCommentDto);
    });

    it('should throw BadRequestException if comment is not found', async () => {
      await expect(await service.findOne('non-existent-id')).toEqual({data:null});
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const blog = await prismaService.blog.findFirst();
      const user = await prismaService.user.findFirst();
      const createCommentDto = {
        content: 'Comment to update',
        blogId: blog.id,
        userId: user.id,
      };

      const { data: createdComment } = await service.create(createCommentDto);

      const updateCommentDto = { content: 'Updated content' };
      const result = await service.update(createdComment.id, updateCommentDto);
      expect(result.data.content).toBe('Updated content');

      // Verify in the database
      const updatedComment = await prismaService.comment.findUnique({
        where: { id: createdComment.id },
      });
      expect(updatedComment.content).toBe('Updated content');
    });

    it('should throw BadRequestException if update fails', async () => {
      await expect(service.update('non-existent-id', { content: 'Fail update' })).rejects.toThrow(BadRequestException)
    });
    
    it('should update with emtry content', async () => {
      
      const blog = await prismaService.blog.findFirst();
      const user = await prismaService.user.findFirst();
      const createCommentDto = {
        content: 'Comment to update',
        blogId: blog.id,
        userId: user.id,
      };
      const commant = await service.create(createCommentDto);
      await expect(service.update(commant.data.id, { content: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const blog = await prismaService.blog.findFirst();
      const user = await prismaService.user.findFirst();
      const createCommentDto = {
        content: 'Comment to delete',
        blogId: blog.id,
        userId: user.id,
      };

      const commant = await service.create(createCommentDto);

      const result = await service.remove(commant.data.id);
      expect(result.data.id).toBe(commant.data.id);

      // Verify in the database
      const deletedComment = await prismaService.comment.findUnique({
        where: { id: commant.data.id },
      });
      expect(deletedComment).toBeNull();
    });

    it('should throw BadRequestException if delete fails', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(BadRequestException);});
  });
});
