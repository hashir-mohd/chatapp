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
    <>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search for users"
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IoSearchOutline
          className="absolute top-3 right-3 text-gray-400"
          size={20}
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-3 shadow-inner max-h-64 overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <UserSearchCard key={user._id} user={user} onClose={onClose} />
          ))
        ) : (
          <div className="flex items-center justify-center h-40">
            {loading ? (
              <Loading />
            ) : (
              <p className="text-gray-500 text-sm">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-3">
        <button
          className="text-gray-400 hover:text-red-500 focus:outline-none transition duration-200"
          onClick={onClose}
        >
          <IoClose size={20} />
        </button>
      </div>
    </>
  );
}

export default SearchUser;
