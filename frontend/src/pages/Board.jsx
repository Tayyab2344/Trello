import { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BoardModal from "../Model/BoardModel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import socket from "../sockets/socket";

const Board = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!orgId || !/^[0-9a-fA-F]{24}$/.test(orgId)) {
      navigate("/");
    }
  }, [orgId, navigate]);

  const {
    data: boards = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["boards", orgId],
    queryFn: async () => {
      try {
        const res = await axios.get(`${api_url}/api/boards/org/${orgId}`);
        return res.data.boards;
      } catch (err) {
        if (err.response?.status === 404) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!orgId && /^[0-9a-fA-F]{24}$/.test(orgId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handleNewBoardAdded = (data) => {
      if (data.board && data.board.organization === orgId) {
        queryClient.setQueryData(["boards", orgId], (old = []) => {
          if (!old.find((b) => b._id === data.board._id)) {
            return [...old, data.board];
          }
          return old;
        });
      }
    };

    socket.on("newBoardAdded", handleNewBoardAdded);

    return () => {
      socket.off("newBoardAdded", handleNewBoardAdded);
    };
  }, [orgId, queryClient]);

  useEffect(() => {
    document.title = "Boards | Trello";
  }, []);

  return (
    <div className="p-8">
      <section>
        <div className="flex items-center gap-3 mb-2">
          <img
            src="https://cdn.brandfetch.io/idToc8bDY1/theme/dark/symbol.svg"
            alt="Trello logo"
            className="w-7 h-7"
          />
          <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
            Most Popular Templates
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-6">
          Get going faster with templates from the Trello community
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: "/mountains.jfif", title: "Kanban Template" },
            { img: "/train.jfif", title: "Daily Task Management" },
            { img: "/pattern.jfif", title: "Remote Team Hub" },
          ].map((template, i) => (
            <Card
              key={i}
              className="group rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <CardHeader className="p-0">
                <CardTitle>
                  <div className="relative w-full h-32">
                    <img
                      src={template.img}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                    <span className="absolute top-2 right-2 bg-white text-xs font-bold px-2 py-1 rounded shadow">
                      TEMPLATE
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="mt-3 px-4 text-gray-800 dark:text-gray-200 font-semibold">
                  {template.title}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Your Boards
        </h2>

        {isLoading ? (
          <p className="text-gray-600">Loading boards...</p>
        ) : isError ? (
          <p className="text-red-500">
            Error fetching boards:{" "}
            {error.response?.data?.message || error.message}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {boards.map((board) => (
              <Card
                key={board._id}
                className="group rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <CardHeader className="p-0">
                  <CardTitle>
                    <div className="relative w-full h-32">
                      <img
                        src={board.image}
                        alt={board.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                      <span className="absolute top-2 right-2 bg-white text-xs font-bold px-2 py-1 rounded shadow">
                        BOARD
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription className="mt-3 px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">
                        {board.title}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {board.members?.length || 0} member
                        {(board.members?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}

            <Card
              className={`flex items-center justify-center rounded-lg shadow-md transition-all duration-300 ${
                orgId
                  ? "hover:shadow-xl hover:scale-105 cursor-pointer bg-gray-100 dark:bg-gray-800"
                  : "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => orgId && setIsModalOpen(true)}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Create New Board
                </span>
              </div>
            </Card>
          </div>
        )}
      </section>

      {isModalOpen && (
        <BoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orgId={orgId}
        />
      )}
    </div>
  );
};

export default Board;
