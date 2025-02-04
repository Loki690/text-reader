import mongoose, {Schema, Document} from "mongoose";

interface Transactions {
    branch: string,
    INV: string,
    min: string,
    date: string,
    VATable: number,
    VatExempt: number,
    ZeroRated: number,
    Government: number,
    Vat12: number
}

const TransactionsSchema: Schema = new Schema({
    branch: { type: String, required: false },
    INV: { type: String, required: false },
    min: {type: String, required: false},
    date: { type: String, required: false },
    VATable: { type: Number, required: false },
    VatExempt: { type: Number, required: false },
    ZeroRated: { type: Number, required: false },
    Government: { type: Number, required: false },
    Vat12: { type: Number, required: false }
});

const TransactionsModel = mongoose.model<Transactions & Document>('Transactions', TransactionsSchema);

export { Transactions, TransactionsModel };