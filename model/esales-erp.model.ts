import mongoose, { Schema, Document } from "mongoose";

interface TableRow {
    label: string;
    textValue: string | number | string[];
    manualInput: string;
    difference: string;
}

export interface EsalesERP extends Document {
    branch?: string;
    date?: string;
    posProfile?: string;
    min?: string;
    tableRows: TableRow[];
}

const TableRowSchema: Schema = new Schema({
    label: { type: String, required: true },
    textValue: { type: Schema.Types.Mixed, required: true },
    manualInput: { type: String, required: false },
    difference: { type: String, required: false },
});

const EsalesSchemaERP: Schema = new Schema({
    branch: { type: String, required: false },
    date: { type: String, required: false },
    posProfile: { type: String, required: false },
    min: { type: String, required: false },
    tableRows: { type: [TableRowSchema], required: true },
});

const EsalesErp = mongoose.model<EsalesERP>("EsalesErp", EsalesSchemaERP);

export default EsalesErp;