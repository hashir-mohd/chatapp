import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import prisma from "../prismaconnect/prisma.js";
import { ApiError } from "../utils/ApiError.js"; // Assuming you have ApiError to handle errors
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate the access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update the user's refreshToken in the database
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    // Return the tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validate that all fields are provided
  if (
    [fullName, email, username, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the email or username already exists in the database
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) throw new ApiError(409, "Email or Username already exists");
    const hashedPassword = await hashPassword(password);


  // Handle avatar and cover image uploads
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   let coverImageLocalPath;

//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath)
//     throw new ApiError(400, "Avatar is required");

//   // Upload images to Cloudinary
//   const avatar = await uploadOnCloudinary(avatarLocalPath, {
//     /* your options */
//   });
//   const coverImage = coverImageLocalPath
//     ? await uploadOnCloudinary(coverImageLocalPath, {
//         /* your options */
//       })
//     : null;

//   if (!avatar) throw new ApiError(400, "Avatar uploading failed");

  // Create the new user in the database
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      username: username.toLowerCase(),
      password: hashedPassword // You should hash the password before saving it
      // avatar: avatar
      // ?{
      //   create: {
      //     fileId: avatar.public_id,
      //     url: avatar.secure_url,
      //   },
      // }:undefined,
      // coverImage: coverImage
      //   ? {
      //       create: {
      //         fileId: coverImage.public_id,
      //         url: coverImage.secure_url,
      //       },
      //     }
      //   : undefined,
    },
  });

  // Fetch the created user without password and refreshToken
  const createdUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      avatar: true,
      coverImage: true,
      refreshToken: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!createdUser) throw new ApiError(500, "Account creation failed");

  // Send response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});




const verifyPassword = async (password, hashedPassword) => {
  // Compare provided password with the hashed password in the database
  return await bcrypt.compare(password, hashedPassword);
};

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    },
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the password is correct
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  // Fetch user details without password or refreshToken
  const loggedInUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      avatar: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Set cookies with the tokens
  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Max-Age=${
      1 * 24 * 60 * 60
    }; Path=/; HttpOnly; Secure; SameSite=None`,
    `refreshToken=${refreshToken}; Max-Age=${
      15 * 24 * 60 * 60
    }; Path=/; HttpOnly; Secure; SameSite=None`,
  ]);

  // Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Extract userId from req.user which is added by the middleware
  
  
  const userId = req.user.id;

  // Remove the refreshToken field from the User record
  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null, // Unset the refreshToken
    },
  });

  // Clear cookies
  res.setHeader("Set-Cookie", [
    "accessToken=; Max-Age=-1; Path=/; HttpOnly; Secure; SameSite=None",
    "refreshToken=; Max-Age=-1; Path=/; HttpOnly; Secure; SameSite=None",
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

  try {
    // Verify the refresh token using JWT
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { id: decodedToken?._id },
    });

    if (!user) throw new ApiError(401, "Invalid refresh Token");

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is Expired or used");
    }

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    // Update the refresh token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set cookies with the new tokens
    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; Max-Age=${
        1 * 24 * 60 * 60
      }; Path=/; HttpOnly; Secure; SameSite=None`,
      `refreshToken=${newRefreshToken}; Max-Age=${
        15 * 24 * 60 * 60
      }; Path=/; HttpOnly; Secure; SameSite=None`,
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id; // The user ID is already extracted by middleware
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Current User fetched successfully"));
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
}