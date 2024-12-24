import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { routes } from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/express-mongo";

mongoose.connect(mongoUri, {})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((error: any) => {
  console.error("Error connecting to MongoDB:", error);
});

app.use(cors());
app.use(bodyParser.json());
app.get("/", (req: Request, res: Response) => {
  res.redirect("/docs");
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use("/", routes);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
