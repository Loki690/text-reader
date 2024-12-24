import { Schema, model, Document } from 'mongoose';

interface IFile extends Document {
    name: string;
    path: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
    name: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const File = model<IFile>('File', fileSchema);

export default File;