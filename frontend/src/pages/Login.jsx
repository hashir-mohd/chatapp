import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "../features/userSlice";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const API = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [data, setData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/users/login", data);
      console.log(response);

      if (response.data.statusCode === 200) {
        toast.success("Login successful");
        dispatch(setToken(response?.data?.data?.accessToken));
        localStorage.setItem("token", response?.data?.data?.accessToken);
        setData({
          usernameOrEmail: "",
          password: "",
        });

        navigate("/");
      }
    } catch (error) {
      toast.error(error?.data?.data?.message);
    }
  };

  return (
    <>
      <h3 className="text-center text-2xl font-bold">Welcome to Chat App!</h3>

      <form
        className="grid gap-4 mt-6 mx-auto max-w-md"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Enter your email or username"
            name="usernameOrEmail"
            value={data.usernameOrEmail}
            onChange={handleOnChange}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            value={data.password}
            onChange={handleOnChange}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-lg px-4 py-2 rounded mt-3 font-bold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Let's Go
        </button>
      </form>

      <p className="my-4 text-center text-sm">
        New User?{" "}
        <Link to="/register" className="hover:text-blue-500 font-semibold">
          Register
        </Link>
      </p>
    </>
  );
}

export default Login;
