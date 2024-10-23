import { Blog } from "src/blog/entities/blog.entity";
import { Comment } from "src/comment/entities/comment.entity";

export class User {
    id: string;
    username: string;
    blog: Blog[];
    comments: Comment[];
}
