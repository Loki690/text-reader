"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ESalesDataSchema = new mongoose_1.Schema({
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
const ESalesDataModel = mongoose_1.default.model('ESalesData', ESalesDataSchema);
exports.default = ESalesDataModel;
