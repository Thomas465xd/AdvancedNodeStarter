import mongoose, { Schema, Document, Model } from "mongoose";
import { UserInterface } from "./User";

export interface BlogInterface extends Document {
    title: string, 
    content: string, 
    imageUrl: string, 
    _user:  UserInterface, 
    createdAt: Date, 
    updatedAt: Date, 
}

// Attributes interface = what you must provide to create a blog
export interface BlogAttrs {
    title: string, 
    content: string, 
    imageUrl?: string, 
    _user: UserInterface
}

// Model interface = adds a build method that uses BlogAttrs
// An interface that describes the properties that are required to create a new Blog
export interface BlogModel extends Model<BlogInterface> {
    build(attrs: BlogAttrs): BlogInterface;
}

const blogSchema = new Schema<BlogInterface>(
    {
        title: {
            type: String, 
            required: true
        },
        content: {
            type: String, 
            required: true
        },
        imageUrl: {
            type: String, 
            required: false
        },
        _user: { 
            type: Schema.Types.ObjectId, 
            ref: "User" 
        }, 
    }, 
    {
        timestamps: true
    }
);

blogSchema.index({ title: 1 }); 
blogSchema.index({ content: 1 }); 
blogSchema.index({  _user: 1 }); 

const Blog = mongoose.model<BlogInterface, BlogModel>('Blog', blogSchema)

export default Blog
