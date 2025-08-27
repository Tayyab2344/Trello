import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const Members = () => {
  const { orgId } = useParams();
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";

  const fetchBoards = async () => {
    try {
      const res = await axios.get(`${api_url}/api/boards/org/${orgId}`);
      setBoards(res.data.boards || []);
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const fetchMembers = async (boardName) => {
    if (!boardName) return;
    try {
      const res = await axios.get(
        `${api_url}/api/boards/${orgId}/${boardName}`
      );
      setMembers(res.data.board.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    document.title = "Members | Trello";
    fetchBoards();
  }, [orgId]);

  useEffect(() => {
    if (selectedBoard) {
      fetchMembers(selectedBoard);
    }
  }, [selectedBoard]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedBoard || !email) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${api_url}/api/boards/${orgId}/${selectedBoard}/members`,
        { email }
      );

      toast.success(res.data.message);
      setEmail("");
      fetchMembers(selectedBoard);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.response?.data?.message || "Error adding member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        👥 Manage Members
      </h2>

      <div className="mb-4">
        <label className="font-semibold mr-2">Select Board:</label>
        <select
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
          className="px-3 py-2 border rounded-md w-full mt-2"
        >
          <option value="">-- Select a Board --</option>
          {boards.map((board) => (
            <option key={board._id} value={board.title}>
              {board.title}
            </option>
          ))}
        </select>
      </div>

      {selectedBoard && (
        <form
          onSubmit={addMember}
          className="flex items-center gap-3 mb-6 mt-4"
        >
          <input
            type="email"
            placeholder="Enter member Gmail ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Adding..." : "➕ Add"}
          </button>
        </form>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Members of {selectedBoard || "..."}
        </h3>
        {members.length > 0 ? (
          <ul className="space-y-3">
            {members.map((m) => (
              <li
                key={m._id}
                className="flex items-center gap-3 p-3 border rounded-md shadow-sm hover:shadow-md transition"
              >
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                  {m.name[0]}
                </span>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No members yet</p>
        )}
      </div>
    </div>
  );
};

export default Members;
