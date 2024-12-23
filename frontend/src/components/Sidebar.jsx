import React, { useState,useEffect } from "react";
import SearchUser from "./SearchUser";
import { use } from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FiArrowUpLeft } from "react-icons/fi";

function Sidebar() {
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const [allUser, setAllUser] = useState([]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    localStorage.clear();
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("sidebar", user._id);

      socketConnection.on("conversation", (data) => {
        console.log("conversation", data);

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
    <>
      <SearchUser onClose={() => setOpenSearchUser(true)} />

      {allUser.length === 0 && (
        <div className="mt-12">
          <div className="flex justify-center items-center my-4 text-slate-500">
            <FiArrowUpLeft size={50} />
          </div>
          <p className="text-lg text-center text-slate-400">
            Explore users to start a conversation with.
          </p>
        </div>
      )}

      {allUser.map((conv, index) => {
        return (
          <NavLink
            to={"/" + conv?.userDetails?._id}
            key={conv?._id}
            className="flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer"
          >
            <div>
              <div
                imageUrl={conv?.userDetails?.profile_pic}
                name={conv?.userDetails?.name}
                width={40}
                height={40}
              ></div>
            </div>
            <div>
              <h3 className="text-ellipsis line-clamp-1 font-semibold text-base">
                {conv?.userDetails?.name}
              </h3>
              <div className="text-slate-500 text-xs flex items-center gap-1">
                <div className="flex items-center gap-1">
                  {conv?.lastMsg?.imageUrl && (
                    <div className="flex items-center gap-1">
                      <span>
                        <FaImage />
                      </span>
                      {!conv?.lastMsg?.text && <span>Image</span>}
                    </div>
                  )}
                  {conv?.lastMsg?.videoUrl && (
                    <div className="flex items-center gap-1">
                      <span>
                        <FaVideo />
                      </span>
                      {!conv?.lastMsg?.text && <span>Video</span>}
                    </div>
                  )}
                </div>
                <p className="text-ellipsis line-clamp-1">
                  {conv?.lastMsg?.text}
                </p>
              </div>
            </div>
            {Boolean(conv?.unseenMsg) && (
              <p className="text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full">
                {conv?.unseenMsg}
              </p>
            )}
          </NavLink>
        );
      })}
    </>
  );
}

export default Sidebar;
