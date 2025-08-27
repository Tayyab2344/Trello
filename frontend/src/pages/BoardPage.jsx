import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import List from "../components/board/List";
import MemberManagement from "../components/board/MemberManagement";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useSelector } from "react-redux";
const BoardPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("board");
  const [editing, setEditing] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const token = user?.token;
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const res = await axios.get(`${api_url}/api/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.board;
    },
    enabled: !!id,
  });

  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ["lists", id],
    queryFn: async () => {
      const res = await axios.get(`${api_url}/api/list/${id}/lists`);
      return res.data.lists;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (board?.title) setTitle(board.title);
    document.title = "List | Trello";
  }, [board]);

  const updateTitle = async () => {
    await axios.patch(
      `${api_url}/api/boards/${id}/title`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    queryClient.invalidateQueries(["board", id]);
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTitleSubmit = async (e) => {
    if (e.key === "Enter") {
      setEditing(false);
      updateTitle();
    }
  };

  const addListMutation = useMutation({
    mutationFn: async (listTitle) => {
      const res = await axios.post(
        `${api_url}/api/list/${id}/create`,

        { title: listTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.list;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["lists", id]);
      setNewListTitle("");
      setShowAddInput(false);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId) => {
      await axios.delete(`${api_url}/api/list/${listId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["lists", id]);
    },
  });

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (type === "list") {
      await axios.patch(`${api_url}/api/list/reorder`, {
        boardId: id,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
      queryClient.invalidateQueries(["lists", id]);
      return;
    }

    if (type === "card") {
      await axios.put(`${api_url}/api/card/${draggableId}/move`, {
        sourceListId: source.droppableId,
        destinationListId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });
      queryClient.invalidateQueries(["cards", source.droppableId]);
      queryClient.invalidateQueries(["cards", destination.droppableId]);
    }
  };

  if (boardLoading || listsLoading) return <p>Loading...</p>;

  return (
    <div
      className="h-screen w-full p-4 overflow-x-auto"
      style={{
        backgroundImage: `url('${board?.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          {editing ? (
            <input
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleSubmit}
              autoFocus
              className="text-2xl font-bold bg-white rounded px-2 py-1 shadow"
            />
          ) : (
            <h1
              onClick={() => setEditing(true)}
              className="text-3xl font-bold text-white cursor-pointer bg-black/40 px-4 py-2 rounded"
            >
              {board?.title || "No title"}
            </h1>
          )}
        </div>

        {board && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <MemberManagement board={board} orgId={board.organization} />
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              className="flex gap-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  index={index}
                  onDeleteList={() => deleteListMutation.mutate(list._id)}
                />
              ))}
              {provided.placeholder}
              {showAddInput ? (
                <div className="w-64 bg-white/80 rounded-md p-4 shadow">
                  <input
                    type="text"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newListTitle.trim()) {
                        addListMutation.mutate(newListTitle);
                      }
                    }}
                    autoFocus
                    className="w-full p-2 border rounded mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => {
                        if (newListTitle.trim()) {
                          addListMutation.mutate(newListTitle);
                        }
                      }}
                    >
                      Add
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-300 rounded"
                      onClick={() => {
                        setShowAddInput(false);
                        setNewListTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-64 bg-white/70 rounded-md p-4 text-gray-700 font-medium hover:bg-white transition"
                  onClick={() => setShowAddInput(true)}
                >
                  + Add List
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardPage;
