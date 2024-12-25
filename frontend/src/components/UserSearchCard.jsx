import React from "react";
import { Link } from "react-router-dom";

const getRandomColor = () => {
  const colors = [
    "#FF6B6B", // Red
    "#6BCB77", // Green
    "#4D96FF", // Blue
    "#F7B32B", // Yellow
    "#E5989B", // Pink
    "#9C88FF", // Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const UserSearchCard = ({ user, onClose }) => {
  return (
    <Link
      to={"/" + user?._id}
      onClick={onClose}
      className="flex items-center gap-3 p-2 lg:p-4 border border-transparent border-b-gray-700 hover:border hover:border-neonGreen rounded cursor-pointer"
    >
      <div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{
            backgroundColor: user?.profile_pic
              ? "transparent"
              : getRandomColor(),
          }}
        >
          {user?.profile_pic ? (
            <img
              src={user?.profile_pic}
              alt={user?.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>
      </div>
      <div>
        <div className="font-semibold text-neonGreen text-ellipsis line-clamp-1">
          {user?.name}
        </div>
        <p className="text-sm text-gray-400 text-ellipsis line-clamp-1">
          {user?.email}
        </p>
      </div>
    </Link>
  );
};

export default UserSearchCard;
