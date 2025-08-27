import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUsers } from "../../store/authslice";
import { useNavigate } from "react-router-dom";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be between 8-12 characters")
      .max(12, "Password must be between 8-12 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmpassword: z.string(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords must match",
    path: ["confirmpassword"],
  });

const Signupform = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  useEffect(() => {
    document.title = "Signup | Trello";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const signupMutation = useMutation({
    mutationFn: async (formData) => {
      const { confirmpassword, ...payload } = formData;

      const res = await axios.post("${api_url}/api/auth/signup", payload, {
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
      console.error("Signup failed:", error.response?.data || error.message);
    },
  });

  const onSubmit = (data) => {
    signupMutation.mutate(data);
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
            <h1 className="font-bold text-2xl ml-3">Signup</h1>
          </div>

          <div className="mx-2 my-3">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register("name")}
              className="border rounded w-full mt-2 p-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
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

          <div className="mx-2 my-3">
            <label htmlFor="confirmpassword" className="font-medium">
              Confirm Password
            </label>
            <input
              id="confirmpassword"
              type="password"
              placeholder="Confirm password"
              {...register("confirmpassword")}
              className="border rounded mt-2 w-full p-2"
            />
            {errors.confirmpassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmpassword.message}
              </p>
            )}
          </div>

          <div className="mx-2 mt-6 space-y-4">
            <button
              type="submit"
              disabled={signupMutation.isLoading}
              className="w-full bg-blue-500 text-white font-bold rounded p-2 disabled:opacity-50 cursor-pointer"
            >
              {signupMutation.isLoading ? "Registering..." : "Signup"}
            </button>

            {signupMutation.isError && (
              <p className="text-red-500 text-center">
                {signupMutation.error.response?.data?.message ||
                  "Signup failed. Try again."}
              </p>
            )}

            {/* {signupMutation.isSuccess && (
              <p className="text-green-500 text-center">Signup successful!</p>
            )} */}

            <button
              type="button"
              className="w-full bg-orange-500 text-white font-bold rounded p-2"
            >
              Google
            </button>

            <button
              type="button"
              className="w-full bg-black text-white font-bold rounded p-2"
            >
              Github
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Signupform;
