import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

const Admin = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [roleToAdd, setRoleToAdd] = useState<AppRole | "">("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "add" | "remove";
    userId: string;
    role: AppRole;
    userName: string;
  } | null>(null);

  // Fetch all profiles with their roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = profiles.map((profile) => ({
        ...profile,
        roles: userRoles
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role),
      }));

      return usersWithRoles;
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role,
      });
      if (error) throw error;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`${role} role added successfully`);
      setConfirmDialog(null);
      setRoleToAdd("");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add role: ${error.message}`);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`${role} role removed successfully`);
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-destructive/80 text-destructive-foreground gap-1">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "doctor":
        return (
          <Badge className="bg-primary/80 text-primary-foreground gap-1">
            <Shield className="h-3 w-3" />
            Doctor
          </Badge>
        );
      case "patient":
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Patient
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const availableRolesToAdd = (currentRoles: AppRole[]) => {
    const allRoles: AppRole[] = ["admin", "doctor", "patient"];
    return allRoles.filter((role) => !currentRoles.includes(role));
  };

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u) => u.roles.includes("admin")).length || 0,
    doctors: users?.filter((u) => u.roles.includes("doctor")).length || 0,
    patients: users?.filter((u) => u.roles.includes("patient")).length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <UserCog className="h-6 w-6 text-primary" />
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                  User Role Management
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 neon-border"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ShieldCheck className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {stats.admins}
                </p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {stats.doctors}
                </p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.patients}
                </p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.full_name || "No name"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <div key={role} className="flex items-center gap-1">
                            {getRoleBadge(role)}
                            {role !== "patient" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    action: "remove",
                                    userId: user.id,
                                    role: role,
                                    userName: user.full_name || user.email || "User",
                                  })
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={selectedUser?.id === user.id ? roleToAdd : ""}
                          onValueChange={(value: AppRole) => {
                            setSelectedUser(user);
                            setRoleToAdd(value);
                            setConfirmDialog({
                              open: true,
                              action: "add",
                              userId: user.id,
                              role: value,
                              userName: user.full_name || user.email || "User",
                            });
                          }}
                        >
                          <SelectTrigger className="w-[140px] bg-muted/30">
                            <SelectValue placeholder="Add role..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {availableRolesToAdd(user.roles).length === 0 ? (
                              <SelectItem value="none" disabled>
                                All roles assigned
                              </SelectItem>
                            ) : (
                              availableRolesToAdd(user.roles).map((role) => (
                                <SelectItem key={role} value={role}>
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-3 w-3" />
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "add" ? "Add Role" : "Remove Role"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "add"
                ? `Are you sure you want to grant ${confirmDialog?.role} privileges to ${confirmDialog?.userName}?`
                : `Are you sure you want to remove ${confirmDialog?.role} privileges from ${confirmDialog?.userName}?`}
              {confirmDialog?.role === "admin" && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ Admin role grants full system access
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog) {
                  if (confirmDialog.action === "add") {
                    addRoleMutation.mutate({
                      userId: confirmDialog.userId,
                      role: confirmDialog.role,
                    });
                  } else {
                    removeRoleMutation.mutate({
                      userId: confirmDialog.userId,
                      role: confirmDialog.role,
                    });
                  }
                }
              }}
              className={
                confirmDialog?.action === "remove"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmDialog?.action === "add" ? "Grant Role" : "Remove Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
