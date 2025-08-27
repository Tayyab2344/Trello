import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUsers } from "../../store/authslice";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Loginform = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  useEffect(() => {
    document.title = "Login | Trello";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post("${api_url}/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setUsers({ token: data.token, user: data.user }));
      localStorage.setItem("userdata", JSON.stringify(data));
      navigate("/");
    },
    onError: (error) => {
      console.error("Login failed:", error.response?.data || error.message);
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="h-screen flex items-center justify-center bg-blue-500 px-4">
        <div className="rounded pb-6 px-6 bg-white shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl">
          <div className="flex items-center justify-center mt-6 mb-8">
            <img
              src="https://cdn.brandfetch.io/idToc8bDY1/theme/dark/symbol.svg"
              alt="trello logo"
              className="w-6 h-6"
            />
            <h1 className="font-bold text-2xl ml-3">Login</h1>
          </div>

          <div className="mx-2 my-3">
            <label htmlFor="email" className="font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              className="border rounded w-full mt-2 p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="mx-2 my-3">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              {...register("password")}
              className="border rounded mt-2 w-full p-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="mx-2 mt-6 space-y-4">
            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full bg-blue-500 text-white cursor-pointer font-bold rounded p-2 disabled:opacity-50"
            >
              {loginMutation.isLoading ? "Logging in..." : "Login"}
            </button>

            {loginMutation.isError && (
              <p className="text-red-500 text-center">
                {loginMutation.error.response?.data?.message ||
                  "Login failed. Try again."}
              </p>
            )}

            {/* {loginMutation.isSuccess && (
              <p className="text-green-500 text-center">Login successful!</p>
            )} */}

            <button
              type="button"
              className="w-full bg-orange-500 cursor-pointer text-white font-bold rounded p-2"
            >
              Google
            </button>

            <button
              type="button"
              className="w-full bg-black cursor-pointer text-white font-bold rounded p-2"
            >
              Github
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Loginform;
