import React from "react";
import { assets } from "../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const { admin, setAdmin, backendUrl } = useContext(AdminContext);
  const { doctor, setDoctor } = useContext(DoctorContext);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      if (admin) {
        const { data } = await axios.post(
          backendUrl + "/api/admin/logout",
          {},
          { withCredentials: true },
        );
        if (data.success) {
          navigate("/");
          setAdmin(false);
        } else {
          toast.error(data.message);
        }
      } else if (doctor) {
        const { data } = await axios.post(
          backendUrl + "/api/doctor/logout",
          {},
          { withCredentials: true },
        );
        if (data.success) {
          navigate("/");
          setDoctor(false);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img
          className="w-36 sm:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {admin ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
