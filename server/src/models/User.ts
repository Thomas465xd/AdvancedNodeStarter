import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserInterface extends Document {
    id: string,
    googleId: string, 
    displayName: string
}

// Attributes interface = what you must provide to create a user
export interface UserAttrs {
    googleId: string, 
    displayName: string,
}

// Model interface = adds a build method that uses UserAttrs
// An interface that describes the properties that are required to create a new User
export interface UserModel extends Model<UserInterface> {
    build(attrs: UserAttrs): UserInterface;
}

const userSchema = new Schema<UserInterface>(
    {
        googleId: { 
            type: String, 
            required: true, 
        }, 
        displayName: {
            type: String, 
            required: true
        }
    }, 
    { 
        timestamps: true 
    }
);

userSchema.index({ googleId: 1 }); 
userSchema.index({ displayName: 1 }); 

const User = mongoose.model<UserInterface, UserModel>('User', userSchema)

export default User