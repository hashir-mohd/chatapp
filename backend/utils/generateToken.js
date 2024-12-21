import jwt from "jsonwebtoken";


export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user.id, // Prisma uses `id` as the primary key
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user.id, // Prisma uses `id` as the primary key
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
