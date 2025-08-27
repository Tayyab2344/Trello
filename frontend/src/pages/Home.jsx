import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutGrid, CheckSquare, Users } from "lucide-react";
import BoardModal from "@/Model/BoardModel";
const Home = () => {
  useEffect(() => {
    document.title = "Home | Trello";
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-around w-full px-8 py-12 bg-white">
        <div className="max-w-md text-center md:text-left">
          <h1 className="font-bold text-4xl md:text-5xl">
            Organize your work,
            <br /> your way
          </h1>
          <p className="py-4 text-gray-600 text-lg">
            Create boards, manage tasks, and collaborate seamlessly with your
            team.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md">
            Get Started
          </Button>
        </div>

        <div className="mt-8 md:mt-0">
          <img
            src="/download.jfif"
            alt="Board Preview"
            className="w-72 h-72 rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className=" my-12 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        <Card className="w-full max-w-sm p-6 shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <LayoutGrid className="text-blue-600 w-10 h-10 mb-3" />
            <CardTitle className="text-xl font-semibold">
              Drag & Drop Boards
            </CardTitle>
            <CardDescription>
              Easily rearrange boards and cards with a smooth drag-and-drop
              interface.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="w-full max-w-sm p-6 shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <CheckSquare className="text-green-600 w-10 h-10 mb-3" />
            <CardTitle className="text-xl font-semibold">
              Task Management
            </CardTitle>
            <CardDescription>
              Organize tasks into to-do lists, assign tasks, and track progress
              effectively.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="w-full max-w-sm p-6 shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <Users className="text-purple-600 w-10 h-10 mb-3" />
            <CardTitle className="text-xl font-semibold">
              Real-Time Collaboration
            </CardTitle>
            <CardDescription>
              Work together with your team seamlessly in real time, anywhere.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <BoardModal />
    </>
  );
};

export default Home;
