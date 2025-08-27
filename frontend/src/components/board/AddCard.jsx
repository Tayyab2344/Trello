import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const AddCard = ({ listId, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const createCard = useMutation({
    mutationFn: async (newTitle) => {
      const res = await axios.post(`${api_url}/api/card/${listId}/cards`, {
        title: newTitle,
      });
      return res.data;
    },
    onSuccess: (data) => {
      onAdd(data.card);
    },
  });

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ title });
    setTitle("");
    setOpen(false);
  };

  return (
    <div className="mt-3">
      {open ? (
        <div className="space-y-2">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            className="w-full border rounded px-2 py-1"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add card
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 px-3 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-gray-600 hover:text-black"
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

export default AddCard;
