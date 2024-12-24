import mongoose, { Schema, Document } from 'mongoose';

export interface IAuth extends Document {
    username: string;
    password: string;
    email: string;
}

const AuthSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

export default mongoose.model<IAuth>('Auth', AuthSchema);