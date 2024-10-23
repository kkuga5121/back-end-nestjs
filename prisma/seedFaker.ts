// prisma/seedFaker.ts
import { PrismaClient, Tag } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(),
      },
    });
    users.push(user);
  }

  // Seed Blogs
  const blogs = [];
  for (let i = 0; i < 20; i++) {
    const blog = await prisma.blog.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs({ min: 3, max: 50 }),
        community: faker.helpers.arrayElement(Object.values(Tag)), // Random Tag enum
        user: {
          connect: {
            id: faker.helpers.arrayElement(users).id, // Random User
          },
        },
      },
    });
    blogs.push(blog);
  }

  // Seed Comments
  for (let i = 0; i < 50; i++) {
    await prisma.comment.create({
      data: {
        content: faker.lorem.sentences(),
        user: {
          connect: {
            id: faker.helpers.arrayElement(users).id, // Random User
          },
        },
        blog: {
          connect: {
            id: faker.helpers.arrayElement(blogs).id, // Random Blog
          },
        },
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });