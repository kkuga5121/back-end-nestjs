import { Tag } from "@prisma/client";
import { Comment } from "src/comment/entities/comment.entity";
import { User } from "src/user/entities/user.entity";

export class Blog {
    id: string;
    title: string;
    content: string;
    community: Tag;
    user: User;
    userId: string;
    comments: Comment[];
}
