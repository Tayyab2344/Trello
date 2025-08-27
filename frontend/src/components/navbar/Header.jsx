import React from "react";
import { Bell, HelpCircle, Search, LayoutGrid } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { cleanUser } from "@/store/authslice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.auth.user);
  return (
    <nav className="w-full h-14 bg-[#1d2125] flex items-center px-4 py-8 shadow-sm ">
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-[#2c333a]">
          <LayoutGrid className="w-6 h-6 text-gray-300" />
        </button>
        <img
          src="https://cdn.brandfetch.io/idToc8bDY1/theme/dark/symbol.svg"
          alt="logo"
          className="w-7 h-7"
        />
      </div>

      <div className="hidden md:flex flex-1 justify-center">
        <div className="relative w-96 max-w-md">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-8 bg-[#2c333a] border-0 text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Button
          variant="default"
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white hidden sm:block"
        >
          Create
        </Button>

        <HelpCircle className="text-gray-300 w-5 h-5 cursor-pointer" />
        <Bell className="text-gray-300 w-5 h-5 cursor-pointer" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar>
                <AvatarFallback className="bg-orange-500 text-white font-bold">
                  {users?.user?.name ? users.user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-40">
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                dispatch(cleanUser());
                navigate("/login");
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Header;
