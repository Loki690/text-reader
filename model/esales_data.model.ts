import mongoose, {Schema, Document} from "mongoose";

export interface ESalesData {
    branchName: string;
    branchCode: string;
    min: string;
    lastOR: string;
    dr: string;
    ar: string;
    form2306: number;
    form2307: number;
    outputVAT: number;
    vatableSales: number;
    zeroRatedSales: number;
    vatExemptSales: number;
    governmentSales: number;
    total: number;
}

const ESalesDataSchema: Schema = new Schema({
    branchName: { type: String, required: true },
    branchCode: { type: String, required: true },
    min: { type: String, required: true },
    lastOR: { type: String, required: true },
    dr: { type: String, required: true },
    ar: { type: String, required: true },
    form2306: { type: Number, required: true },
    form2307: { type: Number, required: true },
    outputVAT: { type: Number, required: true },
    vatableSales: { type: Number, required: true },
    zeroRatedSales: { type: Number, required: true },
    vatExemptSales: { type: Number, required: true },
    governmentSales: { type: Number, required: true },
    total: { type: Number, required: true }
});

const ESalesDataModel = mongoose.model<ESalesData & Document>('ESalesData', ESalesDataSchema);

export default ESalesDataModel;

