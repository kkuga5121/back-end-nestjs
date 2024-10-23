import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import exp from 'constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService : PrismaService;
  let spy: jest.SpyInstance;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService,PrismaService]
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Connect Prisma
    await prismaService.$connect();

    // Clean up before test
    await prismaService.user.deleteMany({});

    //Do not show error message
    spy = jest.spyOn(console, 'error').mockImplementation(() => null);
  
  });

  afterEach(async () => {
    // Clean up after tests
    await prismaService.user.deleteMany({});

    // Disconnect Prisma
    await prismaService.$disconnect();
    
    spy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create',()=>{
    it('create user', async () => {
      const createBlogDto: CreateUserDto = {
        username:'user-test'
      };

      const result = await service.create(createBlogDto);

      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.username).toEqual(createBlogDto.username);
    });
  });

  describe('find',() =>{
    it('should return users',async () =>{
      
      const createBlogDto: CreateUserDto = {
        username:'user-test'
      };

      const user = await service.create(createBlogDto);
      const result = await service.findAll();
      
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(1)
    })

    it('should return user find by id',async() =>{
      const createBlogDto: CreateUserDto = {
        username:'user-test'
      };

      const user = await service.create(createBlogDto);
      const result = await service.findOne(user.data.id)    
      expect(result.data).toBeDefined()
      expect(result.data.username).toEqual(user.data.username)
    })

    it('should return user find by username',async() =>{
      const createBlogDto: CreateUserDto = {
        username:'user-test'
      };

      const user = await service.create(createBlogDto);
      const result = await service.findOneByUsername(createBlogDto.username)    
      expect(result.data).toBeDefined()
      expect(result.data.id).toEqual(user.data.id)
    })

    it('should return null for a non-existent user ID', async () => {
      const result = await service.findOne('non-existent-id');
      expect(result.data).toBeNull();
    });
  })
  
  describe('update', () => {
    it('should update a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'user-test',
      };

      const user = await service.create(createUserDto);
      const updateUserDto: UpdateUserDto = {
        username: 'updated-user-test',
      };

      const updatedUser = await service.update(user.data.id, updateUserDto);

      expect(updatedUser.data).toBeDefined();
      expect(updatedUser.data.id).toEqual(user.data.id);
      expect(updatedUser.data.username).toEqual(updateUserDto.username);
    });

    it('should return null when updating a non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'non-existent-user',
      };

      const result =  service.update('non-existent-id', updateUserDto);
      expect(result).rejects.toThrow(BadRequestException)
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'user-test',
      };

      const user = await service.create(createUserDto);
      const deletedUser = await service.remove(user.data.id);

      expect(deletedUser.data).toBeDefined();
      expect(deletedUser.data.id).toEqual(user.data.id);

      // Verify the user no longer exists
      const result = await service.findOne(user.data.id);
      expect(result.data).toBeNull();
    });

    it('should return null when deleting a non-existent user', async () => {
      const result =  service.remove('non-existent-id');
      expect(result).rejects.toThrow(BadRequestException)
    });
  });
});
