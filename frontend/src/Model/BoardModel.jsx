import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const BoardModal = ({ isOpen, onClose, orgId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const users = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      fetch(
        `https://api.unsplash.com/photos/random?count=9&client_id=${UNSPLASH_ACCESS_KEY}`
      )
        .then((res) => res.json())
        .then((data) => setImages(data))
        .catch((err) => console.error("Error fetching images:", err));
    }
  }, [isOpen]);

  const createBoardMutation = useMutation({
    mutationFn: async (newBoard) => {
      const res = await axios.post(
        `http://localhost:5000/api/org/${orgId}/boards`,
        newBoard
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["boards", orgId]);
      setBoardTitle("");
      setSelectedImage(null);
      onClose();
    },
    onError: (error) => {
      console.error("Create board error:", error); // Debug log
      alert(
        `Error creating board: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const handleCreateBoard = () => {
    console.log("Creating board with orgId:", orgId); // Debug log
    if (!orgId) {
      alert(
        "Cannot create board: No organization selected. Please select an organization from the sidebar."
      );
      return;
    }
    if (!boardTitle) {
      alert("Please enter a board title");
      return;
    }
    if (!selectedImage) {
      alert("Please select a board cover image");
      return;
    }

    const newBoard = {
      title: boardTitle,
      image: selectedImage,
      owner: users?.user.id,
      organization: orgId,
    };

    createBoardMutation.mutate(newBoard);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Board</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img.urls.small)}
              className={`cursor-pointer rounded overflow-hidden ${
                selectedImage === img.urls.small
                  ? "border-2 border-blue-500"
                  : ""
              }`}
            >
              <img
                src={img.urls.small}
                alt={img.alt_description || `Image ${idx + 1}`}
                className="w-full h-24 object-cover"
              />
            </div>
          ))}
        </div>

        <input
          type="text"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          placeholder="Enter board title..."
          className="w-full mt-4 p-2 border rounded"
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateBoard}
            disabled={createBoardMutation.isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createBoardMutation.isLoading ? "Creating..." : "Create Board"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;
