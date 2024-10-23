import { Blog } from "src/blog/entities/blog.entity";
import { User } from "src/user/entities/user.entity";

export class Comment {

  id: string;
  content: string;
  user: User;
  userId: string;
  blog: Blog;
  blogId: string;
}
