import React, { useState } from "react";
import {
  Home,
  Settings,
  Users,
  Activity,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FourSquare } from "react-loading-indicators";
import { useDispatch } from "react-redux";
import { setActiveorgid } from "../../store/organizationSlice";
import store from "@/store/store";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [editingOrg, setEditingOrg] = useState(null);
  const [editName, setEditName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const users = useSelector((state) => state.auth.user);
  const token = users?.token;
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await axios.get(`${api_url}/api/org`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.organizations;
    },
  });

  const createOrg = useMutation({
    mutationFn: async (name) => {
      const res = await axios.post(
        `${api_url}/api/org/newOrg`,
        {
          name,
          owner: users?.user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.organization;
    },
    onSuccess: (org) => {
      queryClient.invalidateQueries(["organizations"]);
      setNewOrgName("");
      dispatch(setActiveorgid(org._id));
      localStorage.setItem("orgid", org._id);
      navigate(`/org/${org._id}/boards`);
    },
  });

  const updateOrg = useMutation({
    mutationFn: async ({ id, name }) => {
      const res = await axios.patch(`${api_url}/api/org/${id}`, {
        name,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["organizations"]);
      setEditingOrg(null);
      setEditName("");
    },
  });

  const deleteOrg = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${api_url}/api/org/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["organizations"]);
      const activeOrgId = store.getState().organization.activeOrgId;
      if (activeOrgId === id) {
        dispatch(setActiveorgid(null));
        navigate("/");
      }
    },
  });

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <FourSquare color="#6817D9FF" size="medium" text="" textColor="" />
      </div>
    );

  if (isError)
    return <div className="p-4 text-red-500">Error loading organizations</div>;

  return (
    <div className="w-64 h-screen border-r bg-white dark:bg-gray-900 p-4">
      <div className="space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent"
        >
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Organizations
          </p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="New org name"
            className="flex-1 px-2 py-1 border rounded-md text-sm"
          />
          <button
            onClick={() => newOrgName && createOrg.mutate(newOrgName)}
            className="p-1 hover:bg-accent rounded-md"
            title="Add Organization"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {data?.map((org) => (
            <div key={org._id}>
              <div className="flex items-center justify-between">
                {editingOrg === org._id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded-md text-sm"
                    />
                    <button
                      onClick={() =>
                        updateOrg.mutate({ id: org._id, name: editName })
                      }
                      className="p-1 hover:bg-accent rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingOrg(null)}
                      className="p-1 hover:bg-accent rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        toggleExpand(org._id);
                      }}
                      className="flex items-center justify-between w-full px-2 py-1 rounded-md hover:bg-accent"
                    >
                      <span>{org.name}</span>
                      {expanded === org._id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOrg(org._id);
                          setEditName(org.name);
                        }}
                        className="p-1 hover:bg-accent rounded-md"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteOrg.mutate(org._id)}
                        className="p-1 hover:bg-accent rounded-md text-red-500"
                        title="Delete"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {expanded === org._id && editingOrg !== org._id && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to={`/org/${org._id}/overview`}
                    className="flex items-center space-x-2 px-2 py-1 text-sm rounded-md hover:bg-accent"
                  >
                    <Home size={16} />
                    <span>Overview</span>
                  </Link>
                  <Link
                    to={`/org/${org._id}/activities`}
                    className="flex items-center space-x-2 px-2 py-1 text-sm rounded-md hover:bg-accent"
                  >
                    <Activity size={16} />
                    <span>Activities</span>
                  </Link>
                  <Link
                    to={`/org/${org._id}/members`}
                    className="flex items-center space-x-2 px-2 py-1 text-sm rounded-md hover:bg-accent"
                  >
                    <Users size={16} />
                    <span>Members</span>
                  </Link>
                  <Link
                    to={`/org/${org._id}/boards`}
                    className="flex items-center space-x-2 px-2 py-1 text-sm rounded-md hover:bg-accent"
                    onClick={() => dispatch(setActiveorgid(org._id))}
                  >
                    <FourSquare size={16} />
                    <span>Boards</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
