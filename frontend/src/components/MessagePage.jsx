import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { data, Link, useParams } from "react-router-dom";
import { AiOutlineCheck, AiFillCheckCircle } from "react-icons/ai";

import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";

import Loading from "./Loading";
import backgroundImage from "../assets/logo.svg";
import { IoMdSend } from "react-icons/io";
import moment from "moment";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);

  {/*user to whom the message will be sent*/}
  const [dataUser, setDataUser] = useState({
    username: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  // console.log(dataUser);

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);
  console.log("all messages are ",allMessage);  
  

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);

      socketConnection.emit("seen", params.userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      socketConnection.on("message", (data) => {
        // console.log("message data", data);
        setAllMessage(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setMessage((preve) => {
      return {
        ...preve,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new-message", {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover text-white"
    >
      <header className="sticky top-0 h-16 bg-gray-900 text-neonGreen flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden text-neonGreen">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <div
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              username={dataUser?.username}
              userId={dataUser?._id}
              className="w-12 h-12 bg-gray-800 rounded-full flex justify-center items-center"
            >
              {dataUser?.profile_pic ? (
                <img
                  src={dataUser?.profile_pic}
                  alt={dataUser?.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                dataUser?.username?.charAt(0)?.toUpperCase() || "U" // First letter of username or "U" if no username
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-neonGreen text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.username}
            </h3>
            <p className="-my-2 text-sm">
              {dataUser.online ? (
                <span className="text-neonGreen">online</span>
              ) : (
                <span className="text-gray-500">offline</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <button className="cursor-pointer hover:text-secondary text-neonGreen">
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/*** Show All Messages */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-gray-800 bg-opacity-50">
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessage &&
            allMessage.length > 0 &&
            allMessage.map((msg, index) => {
              return (
                <div
                  key={index}
                  className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                    user._id === msg?.msgByUserId
                      ? "ml-auto bg-teal-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <p className="px-2 flex justify-center items-center">
                    {msg.text}
                    <div>
                      {user._id === msg?.msgByUserId ? (
                        msg.seen ? (
                          <p className="text-xs ml-auto w-fit flex items-center gap-1">
                            <AiFillCheckCircle className="text-neonGreen" />
                          </p>
                        ) : (
                          <p className="text-xs ml-auto w-fit flex items-center gap-1">
                            <AiOutlineCheck className="text-gray-500" />
                          </p>
                        )
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </p>

                  <p className="text-xs ml-auto w-fit text-gray-400">
                    {moment(msg.createdAt).format("hh:mm")}
                  </p>
                </div>
              );
            })}
        </div>

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      {/** Send Message */}
      <section className="h-16 bg-gray-900 flex items-center px-4">
        <div className="relative"></div>

        {/** Input Box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            className="py-1 px-4 outline-none w-full h-full bg-gray-800 text-gray-300 placeholder-gray-500"
            value={message.text}
            onChange={handleOnChange}
          />
          <button className="text-neonGreen hover:text-secondary">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
