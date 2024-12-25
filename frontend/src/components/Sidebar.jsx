import React, { useState,useEffect } from "react";
import SearchUser from "./SearchUser";
import { use } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowUpLeft } from "react-icons/fi";
import { logout } from "../features/userSlice";
import "../index.css";


function Sidebar() {
  const user = useSelector((state) => state?.user);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    localStorage.clear();
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("sidebar", user._id);

      socketConnection.on("conversation", (data) => {
        

        const conversationUserData = data.map((conversationUser, index) => {
          if (
            conversationUser?.sender?._id === conversationUser?.receiver?._id
          ) {
            return {
              ...conversationUser,
              userDetails: conversationUser?.sender,
            };
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return {
              ...conversationUser,
              userDetails: conversationUser.receiver,
            };
          } else {
            return {
              ...conversationUser,
              userDetails: conversationUser.sender,
            };
          }
        });

        setAllUser(conversationUserData);
      });
    }
  }, [socketConnection, user]);

  return (
    <div className="w-full h-full grid grid-cols-[60px,1fr] bg-black">
      {/* Sidebar */}
      <div className="bg-gray-800 h-full py-5 text-gray-300 flex flex-col justify-between rounded-tr-lg rounded-br-lg">
        <div className="space-y-3">
          <NavLink
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-neonGreen rounded ${
                isActive && "bg-neonGreen text-black"
              }`
            }
            title="Chat"
          >
            <IoChatbubbleEllipses size={20} />
          </NavLink>

          <div
            title="Add Friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-neonGreen rounded"
          >
            <FaUserPlus size={20} />
          </div>
        </div>

        <div>
          <button
            title="Logout"
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-neonGreen rounded"
            onClick={handleLogout}
          >
            <span className="-ml-2">
              <BiLogOut size={20} />
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center bg-gray-900">
          <h2 className="text-xl font-bold px-4 text-neonGreen">Messages</h2>
        </div>
        <div className="bg-gray-700 h-[1px]"></div>

        {/* Content Area */}
        <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gray-900 p-4 scrollbar">
          {allUser.length === 0 ? (
            <div className="flex flex-col items-center mt-12">
              <FiArrowUpLeft size={50} className="text-neonGreen" />
              <p className="text-lg text-center text-gray-500 mt-4">
                Explore users to start a conversation with.
              </p>
            </div>
          ) : (
            allUser.map((conv, index) => (
              <NavLink
                to={"/" + conv?.userDetails?._id}
                key={conv?._id}
                className="flex items-center gap-3 py-3 px-3 border border-transparent hover:border-neonGreen rounded hover:bg-gray-800 cursor-pointer"
              >
                <div>
                  {conv?.userDetails?.profile_pic ? (
                    <img
                      src={conv.userDetails.profile_pic}
                      alt={conv.userDetails.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}
                      style={{
                        backgroundColor: getRandomColor(conv?.userDetails?._id),
                      }}
                    >
                      {conv?.userDetails?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-ellipsis line-clamp-1 font-semibold text-base text-neonGreen">
                    {conv?.userDetails?.username}
                  </h3>
                  <div className="text-gray-400 text-xs">
                    <p className="text-ellipsis line-clamp-1">
                      {conv?.lastMsg?.text}
                    </p>
                  </div>
                </div>
                {Boolean(conv?.unseenMsg) && (
                  <div className="text-xs bg-neonGreen w-6 h-6 flex justify-center items-center ml-auto text-black font-semibold rounded-full">
                    {conv?.unseenMsg}
                  </div>
                )}
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* Search User Modal */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
}

export default Sidebar;
