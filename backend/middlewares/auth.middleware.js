import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import prisma from "../prismaconnect/prisma.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Check if the request is from a guest user
    if (req.query.guest === "true") {
      req.user = null; // Set req.user to null for guest users
      return next();
    }

    
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Use Prisma to find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: decodedToken?._id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        coverImage: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
