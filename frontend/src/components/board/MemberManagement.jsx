import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Plus, X, Mail, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import toast from "react-hot-toast";

const MemberManagement = ({ board, orgId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState(board?.members || []);
  const queryClient = useQueryClient();

  const api_url = import.meta.env.PROD
    ? "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app"
    : "http://localhost:4000";

  useEffect(() => {
    setMembers(board?.members || []);
  }, [board]);

  const addMemberMutation = useMutation({
    mutationFn: async (memberEmail) => {
      const res = await axios.post(
        `${api_url}/api/boards/${orgId}/${board.title}/members`,
        { email: memberEmail }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Member added successfully!");
      setEmail("");
      setMembers(data.board.members);
      queryClient.invalidateQueries(["boards", orgId]);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add member";
      toast.error(message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      const res = await axios.patch(
        `${api_url}/api/boards/${board._id}/members/remove`,
        { memberId }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Member removed successfully!");
      setMembers(data.board.members);
      queryClient.invalidateQueries(["boards", orgId]);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to remove member";
      toast.error(message);
    },
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    addMemberMutation.mutate(email);
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Members ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add New Member</CardTitle>
              <CardDescription className="text-xs">
                Invite someone to collaborate on this board
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={addMemberMutation.isPending}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addMemberMutation.isPending}
                  className="gap-1"
                >
                  {addMemberMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Members */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Members</CardTitle>
              <CardDescription className="text-xs">
                {members.length} member{members.length !== 1 ? "s" : ""} with
                access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No members yet. Add someone to get started!
                  </p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-blue-500 text-white">
                            {member.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                      {member._id !== board?.owner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={removeMemberMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberManagement;
