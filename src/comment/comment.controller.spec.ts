import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CommentController', () => {
  let controller: CommentController;
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
      controllers: [CommentController],
      providers: [CommentService, PrismaService],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
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
    expect(controller).toBeDefined();
  });

 describe('create Case',()=>{
  it('should create a comment', async () => {
    const blog = await prismaService.blog.findFirst();
    const user = await prismaService.user.findFirst();
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
        blogId: blog.id,
        userId: user.id,
    };

    const result = await controller.create(createCommentDto);
    expect(result).toHaveProperty('data');
    expect(result.data).toBeDefined()
    expect(result.data.content).toEqual(createCommentDto.content)
  });
  it('should create with blogId do not Exist',async () =>{
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      blogId: 'non-existent-blog-id',
      userId: 'test-user-id',
    };
    
    //const result = await controller.create(createCommentDto);
    await expect(controller.create(createCommentDto)).rejects.toThrow(BadRequestException);

  });
  it('should create with userId do not Exist',async () =>{
    
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      blogId: 'test-blog-id',
      userId: 'non-user-id',
    };
    
    //const result = await controller.create(createCommentDto);
    await expect(controller.create(createCommentDto)).rejects.toThrow(BadRequestException);

  });
 })
  describe('Find Case',() => {
    it('should find all comments by blog id', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Blog comment 1',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };
  
      await controller.create(createCommentDto);
      const comments = await controller.findAllByBlog('test-blog-id');
      expect(Array.isArray(comments.data)).toBe(true);
      expect(comments.data.length).toBeGreaterThan(0); // At least one comment should exist
    });
  
    it('should find all comments', async () => {
      const comments = await controller.findAll();
      expect(Array.isArray(comments.data)).toBe(true);
    });
  
    it('should find one comment by id', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Another test comment',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };
  
      const comment = await controller.create(createCommentDto);
      const foundComment = await controller.findOne(comment.data.id);
      expect(foundComment.data).toEqual(comment.data);
    });

  });

  describe('Update Case',()=>{
    it('should update a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Comment to be updated',
        blogId: 'test-blog-id',
        userId: 'test-user-id',
      };
  
      const comment = await controller.create(createCommentDto);
      const updateCommentDto: UpdateCommentDto = {
        content: 'Updated comment content',
      };
  
      const updatedComment = await controller.update(comment.data.id, updateCommentDto);
      expect(updatedComment.data.content).toBe(updateCommentDto.content);
    });
  });

  describe('Remove Case',()=>{
    it('should remove a comment', async () => {
      const blog = await prismaService.blog.findFirst();
      const user = await prismaService.user.findFirst();
      const createCommentDto: CreateCommentDto = {
        content: 'Comment to be deleted',
        blogId: blog.id,
        userId: user.id,
      };
  
      const comment = await controller.create(createCommentDto);
      const removedComment = await controller.remove(comment.data.id);
      expect(removedComment).toEqual(comment);
      const findComment =  await controller.findOne(comment.data.id);
      // Verify that the comment no longer exists
      expect(findComment).toEqual({data:null})
    });
  });
});
