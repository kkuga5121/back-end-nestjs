import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from 'src/blog/dto/create-blog.dto';
import exp from 'constants';

describe('UserController', () => {
  let controller: UserController;
  let service : UserService;
  let prismaService : PrismaService;
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
      controllers: [UserController],
      providers: [UserService,PrismaService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService)

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
    await prismaService.comment.create({
      data:{
        id: 'test-comment-id',
        content:'Content Test',
        userId:'test-user-id',
        blogId:'test-blog-id'
      }
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

  describe('Find',() =>{
    it('should return blogs of user find by username',async() =>{
      ;

      const blog = await prismaService.blog.create({
        data: {
          title: 'Test Blog Title',
          content: 'Test Blog Content',
          community: 'HISTORY',
          userId:'test-user-id'
        }
      })
      const result = await controller.findOneByUsername("blog_user") 
      console.log(result)   
      expect(result.data).toBeDefined()
      expect(result.data.blogs).toBeInstanceOf(Array)
      expect(result.data.blogs.length).toBeGreaterThanOrEqual(1)
    })
  })
  describe('Remove',() => {
   it('should delate all blog and comment with user',async ()=>{
    const createBlogDto: CreateUserDto = {
      username:'comment-user'
    };
    const user = await controller.create(createBlogDto);
    const comment = await prismaService.comment.create({
      data:{
        content:'test comment',
        userId:user.data.id,
        blogId:'test-blog-id'
      }
    })
    const deletedUser = await controller.remove(user.data.id)
    
    expect(deletedUser.data).toBeDefined();
    expect(deletedUser.data.id).toEqual(user.data.id);
    const commentCheck = await prismaService.comment.findMany({
      where:{
        userId:user.data.id
      }
    })
    expect(commentCheck).toBeInstanceOf(Array)
    expect(commentCheck).toHaveLength(0)
   })
  })
});
