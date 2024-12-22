import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {server, app} from "./socket/index.js";

// const app = express();
dotenv.config();



const port = process.env.PORT || 8000;


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`  ⚙️   Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed !! ", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});
import userRouter from "./routes/user.routes.js";
app.use('/users', userRouter);