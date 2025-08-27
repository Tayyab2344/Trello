import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, LayoutGrid, Activity } from "lucide-react";
import { useSelector } from "react-redux";

const OrgOverview = () => {
  const user = useSelector((state) => state.auth.user);
  const token = user?.token;
  const { orgId } = useParams();
  const api_url =
    "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      const [orgRes, actRes] = await Promise.all([
        axios.get(`${api_url}/api/org`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get(`${api_url}/api/activities/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      const org = orgRes.data.organizations.find((o) => o._id === orgId);
      const activities = actRes.data.activities.slice(0, 3);

      const boardMembers = org.boards?.flatMap((b) => b.members) || [];
      const combinedMembers = [...org.members, ...boardMembers];
      const uniqueMembers = combinedMembers.reduce((acc, m) => {
        if (!acc.find((x) => x._id === m._id)) acc.push(m);
        return acc;
      }, []);

      return { org, activities, members: uniqueMembers };
    },
    enabled: !!orgId,
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !data)
    return <div className="p-4 text-red-500">Error loading organization</div>;

  const { org, activities, members } = data;
  const membersCount = members?.length || 0;
  const boardsCount = org.boards?.length || 0;
  const createdDate = new Date(org.createdAt).toLocaleDateString();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        <span className="text-sm text-gray-500">Created: {createdDate}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Users size={18} />
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {membersCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <LayoutGrid size={18} />
            <CardTitle>Boards</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {boardsCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Activity size={18} />
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities?.length ? (
              <ul className="space-y-2 text-sm">
                {activities.map((a) => (
                  <li key={a._id} className="text-gray-700">
                    <span className="font-medium">{a.user?.name}</span>{" "}
                    {a.action}
                    <span className="text-gray-500">
                      {" "}
                      ({new Date(a.createdAt).toLocaleDateString()})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">No recent activity</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Boards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {org.boards?.map((board) => (
            <Link
              to={`/boards/${board._id}`}
              key={board._id}
              className="block rounded-lg shadow bg-white overflow-hidden hover:shadow-md transition"
            >
              <img
                src={board.image}
                alt={board.title}
                className="w-full h-28 object-cover"
              />
              <div className="p-3 font-medium">{board.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrgOverview;
