import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre<IUser>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;