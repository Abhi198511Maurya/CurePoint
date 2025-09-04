import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";

const Login = () => {
  const { backendUrl, user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign Up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(
          backendUrl + "/api/user/register",
          {
            name,
            password,
            email,
            otpCode,
          },
          { withCredentials: true },
        );
        if (data.success) {
          setUser(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/user/login",
          {
            email,
            password,
          },
          { withCredentials: true },
        );
        if (data.success) {
          setUser(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendOtpCode = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/send-otp",
        { email },
        { withCredentials: true },
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const verifyOtpCode = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-otp",
        { email, otpCode },
        { withCredentials: true },
      );
      if (data.success) {
        setIsVerified(true);
        toast.success(data.message);
      } else {
        setIsVerified(false);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    if (otpCode.length === 6) {
      verifyOtpCode();
    }
  }, [otpCode]);

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "sign up" : "log in"} to book
          appointment
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              id=""
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            id=""
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            id=""
            required
          />
        </div>
        {state === "Sign Up" && (
          <div className="w-full relative">
            <p>Enter OTP Code</p>
            <input
              className={`border rounded w-full p-2 mt-1 focus:outline-none  ${isVerified ? "border-green-500" : otpCode.length > 0 ? "border-red-500" : "border-gray-300"}`}
              type="text"
              onChange={(e) => setOtpCode(e.target.value)}
              value={otpCode}
              id=""
              required
              maxLength={6}
            />
            {otpCode.length > 0 && (
              <span className="absolute inset-y-11 right-3 flex items-center">
                {isVerified ? (
                  <Check className="text-green-500 w-5 h-5" />
                ) : (
                  <X className="text-red-500 w-5 h-5" />
                )}
              </span>
            )}
          </div>
        )}
        {state === "Sign Up" && (
          <p
            onClick={sendOtpCode}
            className="bg-green-500 text-center text-white w-full py-2 rounded-md text-base cursor-pointer"
          >
            Send OTP
          </p>
        )}

        <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {state === "Sign Up" ? (
          <p className="">
            Already have an account?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Login")}
            >
              login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Sign Up")}
            >
              click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
