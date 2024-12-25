import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Loading from "./Loading";
import UserSearchCard from "./UserSearchCard";
import toast from "react-hot-toast";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { use } from "react";

function SearchUser({ onClose }) {
  const API = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearchUser();
  }, [search]);

  const handleSearchUser = async () => {
    try {
      setLoading(true);
      const {data} = await API.post(`/users/search-user`, {search:search});
      console.log(data.data);
      setLoading(false);
      setUsers(data?.data);
    } catch (error) {
      toast.error(error?.data?.data?.message);
    }
  };

  console.log(users);
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 z-10">
      <div className="w-full max-w-lg mx-auto mt-10">
        {/** Input Search User */}
        <div className="bg-gray-800 rounded h-14 overflow-hidden flex">
          <input
            type="text"
            placeholder="Search user by name, email..."
            className="w-full outline-none py-1 h-full px-4 bg-gray-800 text-gray-300 placeholder-gray-500"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <div className="h-14 w-14 flex justify-center items-center text-neonGreen">
            <IoSearchOutline size={25} />
          </div>
        </div>

        {/** Display Search User */}
        <div className="bg-gray-900 mt-2 w-full p-4 rounded h-full max-h-[70vh] overflow-scroll">
          {/** No User Found */}
          {users.length === 0 && !loading && (
            <p className="text-center text-gray-500">No user found!</p>
          )}

          {loading && (
            <p>
              <Loading />
            </p>
          )}

          {users.length !== 0 &&
            !loading &&
            users.map((user, index) => {
              return (
                <UserSearchCard key={user._id} user={user} onClose={onClose} />
              );
            })}
        </div>
      </div>

      <div
        className="absolute top-0 right-0 text-2xl p-2 lg:text-4xl text-gray-300 hover:text-neonGreen cursor-pointer"
        onClick={onClose}
      >
        <button>
          <IoClose />
        </button>
      </div>
    </div>
  );
}

export default SearchUser;
