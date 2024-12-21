import prisma from "./prismaconnect/prisma.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";



dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

async function startServer(){
    try {
        await prisma.$connect();
        console.log("Connected to the mongodb with prisma");
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.log("Failed to connect to mongodb", error);
        
    }
}
startServer();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});


import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";

app.use("/users", userRouter);
app.use("/posts", postRouter);







