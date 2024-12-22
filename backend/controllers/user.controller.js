import { ApiError } from "../utils/ApiError.js"; // Assuming you have ApiError to handle errors
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (
    [email, username, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(409, "Email or Username already exists");
  // const avatarLocalPath = req.files?.avatar[0]?.path;

  // let coverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }

  // if (!avatarLocalPath)
  //   throw new ApiError(400, "Avatar is required (in backend controller)");

  // const avatar = await uploadOnCloudinary(avatarLocalPath, avatar_upOptions);
  // const coverImage = await uploadOnCloudinary(
  //   coverImageLocalPath,
  //   coverImg_upOptions
  // );

  // if (!avatar) throw new ApiError(400, "Avatar uploading failed");

  const user = await User.create({
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Account creation failed");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail)
    throw new ApiError(400, "Username or email is required");

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid User credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Max-Age=${
      1 * 24 * 60 * 60
    }; Path=/; HttpOnly; Secure; SameSite=None`,
    `refreshToken=${refreshToken}; Max-Age=${
      15 * 24 * 60 * 60
    }; Path=/; HttpOnly; Secure; SameSite=None`,
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in Successfully"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  //findUser from req.user which comes from middleware
  //delete cookies
  //remove access token and refresh token

  const userId = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 }, //removes the field form document
    },
    {
      new: true,
    }
  );

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
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh Token");

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is Expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

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
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "Current User fetched successfully"
      )
    );
});

const searchUser = asyncHandler(async (req, res) => {
  const { search } = req.body;
  if (!search) throw new ApiError(400, "Search field is required");
  const query = new RegExp(search, "i");
  const user = await User.find({
    $or: [{ username: query }, { email: query }],
  }).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  searchUser,
};
