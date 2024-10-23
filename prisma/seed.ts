// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Sample with Long Content Over 1,000 Char
const longContent =`
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris. 
Curabitur tempus mollis sapien, ac fermentum nibh varius nec. Ut ac orci vestibulum, 
luctus lorem a, efficitur arcu. In hac habitasse platea dictumst. Vivamus venenatis 
egestas ligula, et auctor metus vehicula id. Maecenas tincidunt, velit sit amet auctor 
egestas, sem ligula blandit arcu, nec lacinia elit nisl eu justo. Curabitur fermentum 
sapien eget ultricies tempus. Aenean gravida risus sit amet ligula aliquet pharetra. 
Integer ullamcorper, purus vel facilisis hendrerit, lacus lorem euismod risus, in interdum 
orci orci vel lectus. Morbi tincidunt nibh at turpis posuere varius. 

Pellentesque volutpat, metus non ullamcorper fringilla, erat ex commodo urna, sed facilisis 
nisl velit nec turpis. Nulla id enim sem. In volutpat libero ut diam sollicitudin, id congue 
ante tristique. Sed at facilisis enim. Aliquam erat volutpat. Sed viverra eu nisl a convallis. 
Praesent id risus in purus ultricies consectetur ac ac ligula. Pellentesque sit amet metus ut 
sapien malesuada aliquam et sed neque. Donec laoreet quam in nisl fermentum scelerisque. Cras 
lacinia congue enim vel tincidunt. Donec sit amet dolor non ante mollis sollicitudin.

Fusce convallis consequat quam in dignissim. Duis vehicula efficitur dolor, et laoreet neque 
efficitur vel. Vivamus feugiat dolor magna, non dictum lorem facilisis in. Sed convallis erat 
nisl, id sagittis turpis scelerisque sit amet. Etiam vel risus consequat, aliquet ipsum in, 
vestibulum est. Nulla facilisi. Curabitur sit amet odio sed justo aliquet venenatis ac id nisi. 
Aenean vulputate pharetra orci, vel faucibus eros tincidunt ut. Nunc sit amet mauris volutpat, 
fermentum augue a, tempor libero. Ut condimentum consectetur est, vel tincidunt ex consectetur 
ut. Morbi sodales, libero sit amet pulvinar dapibus, ante tortor posuere neque, id lobortis felis 
purus eget purus. 

In finibus elementum sapien, sed scelerisque lorem bibendum sit amet. Phasellus ultrices velit 
nec risus pharetra tristique. Duis gravida neque ac quam tristique, at tincidunt justo sodales. 
Phasellus facilisis fringilla dapibus. Etiam sed arcu purus. Integer id metus ut purus euismod 
tincidunt sed et nulla. 
`;


async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'jane_doe',
    },
  });

  // Create sample blog posts
  const post1 = await prisma.blog.create({
    data: {
      title: 'First Blog Post',
      content: 'This is the content of the first blog post.',
      community:'OTHERS',
      userId:user1.id
    },
  });

  const post2 = await prisma.blog.create({
    data: {
      title: 'Second Blog Post',
      content: longContent,
      community:'HISTORY',
      userId:user2.id
    },
  });

  // Create sample comments for the blog posts
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great post!',
        userId: user1.id,
        blogId: post1.id,
      },
      {
        content: 'Very informative.',
        userId: user2.id,
        blogId: post1.id,
      },
      {
        content: 'I learned a lot from this.',
        userId: user1.id,
        blogId: post2.id,
      },
    ],
  });

  console.log('Sample data has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
