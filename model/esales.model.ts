import mongoose, { Schema, Document } from "mongoose";

interface TableRow {
    label: string;
    textValue: string | number | string[];
    manualInput: string;
    difference: string;
}

export interface Esales extends Document {
    tableRows: TableRow[];
}

const TableRowSchema: Schema = new Schema({
    label: { type: String, required: true },
    textValue: { type: Schema.Types.Mixed, required: true },
    manualInput: { type: String, required: false },
    difference: { type: String, required: false },
});

const EsalesSchema: Schema = new Schema({
    branch: { type: String, required: false },
    date: { type: String, required: false },
    tableRows: { type: [TableRowSchema], required: true },
});

const Esales = mongoose.model<Esales>("Esales", EsalesSchema);

export default Esales;
