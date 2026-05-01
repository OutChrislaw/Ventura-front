"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  Users,
  FileText,
  Trash2,
  Edit,
  PlusCircle,
  X,
  LogOut,
  LayoutDashboard,
  Key,
  Mail,
  Eye,
  EyeOff,
  Handshake,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="adminSidebar">
      <div className="adminLogo">
        <Link href="/admin" className="adminLogoLink">
          <span className="adminLogoText">VENTURA ADMIN</span>
        </Link>
      </div>

      <nav className="adminSidebarNav">
        <Link
          href="/admin"
          className={`adminNavItem ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/admin/users"
          className={`adminNavItem active`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} />
          <span>Users</span>
        </Link>
        <Link
          href="/admin/posts"
          className={`adminNavItem ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} />
          <span>Posts</span>
        </Link>
        <Link
          href="/admin/partnerships"
          className={`adminNavItem ${activeTab === "partnerships" ? "active" : ""}`}
          onClick={() => setActiveTab("partnerships")}
        >
          <Handshake size={18} />
          <span>Partnerships</span>
        </Link>
        <Link
          href="/admin/messages"
          className={`adminNavItem ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <Mail size={18} />
          <span>Messages</span>
        </Link>
        <Link href="/feed" className="adminNavItem">
          <Home size={18} />
          <span>Back to Feed</span>
        </Link>
      </nav>

      <div className="adminSidebarFooter">
        <div className="adminUserInfo">
          <div className="adminUserAvatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="adminUserDetails">
            <span className="adminUserName">{user?.name}</span>
            <span className="adminUserRole">Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} className="adminLogoutBtn">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminUsers() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { fetchUsers, deleteUser, updateUserRole, updateUser } =
    useContext(AdminContext);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [showRoleModal, setShowRoleModal] = useState<{
    id: number;
    name: string;
    role: string;
    isAdmin: boolean;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "innovator",
    is_admin: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.is_admin) {
      loadUsers();
    }
  }, [authLoading, user]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ventur_token")}`,
        },
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "innovator",
        is_admin: false,
      });
      setShowCreatePassword(false);
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
    setSubmitting(false);
  };

  const handleDeleteUser = async (id: number) => {
    await deleteUser(id);
    setShowDeleteConfirm(null);
    loadUsers();
  };

  const handleUpdateRole = async (
    id: number,
    role: string,
    isAdmin: boolean,
  ) => {
    await updateUserRole(id, role, isAdmin);
    setShowRoleModal(null);
    loadUsers();
  };

  const handleEditClick = (u: any) => {
    setShowEditModal({
      id: u.id,
      name: u.name,
      email: u.email,
    });
    setEditEmail(u.email);
    setEditPassword("");
    setEditConfirmPassword("");
    setEditError("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
  };

  const handleUpdateUser = async () => {
    if (editPassword && editPassword !== editConfirmPassword) {
      setEditError("Passwords do not match");
      return;
    }
    if (editPassword && editPassword.length < 8) {
      setEditError("Password must be at least 8 characters");
      return;
    }
    setEditError("");
    setUpdating(true);
    try {
      await updateUser(showEditModal!.id, editEmail, editPassword || undefined);
      setShowEditModal(null);
      loadUsers();
      alert("User updated successfully!");
    } catch (error) {
      setEditError("Failed to update user");
    }
    setUpdating(false);
  };

  if (authLoading) {
    return (
      <div className="adminLoadingBlack">
        <Loader fullPage text="Authenticating..." />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <ProtectedRoute>
        <div className="adminAccessDenied">
          <div className="adminAccessDeniedCard">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <Link href="/feed">Go to Feed</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="adminApp">
        <AdminNav />
        <main className="adminMainContent">
          <div className="adminHeaderRow">
            <h1>User Management</h1>
            <div className="adminHeaderRight">
              <button
                className="adminCreateBtn"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusCircle size={18} /> Add New User
              </button>
            </div>
          </div>

          <div className="adminCard">
            {loading ? (
              <div className="adminLoadingInline">
                <Loader text="Loading users..." />
              </div>
            ) : (
              <div className="adminTableWrapper">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Admin</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`adminRoleBadge ${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.is_admin ? (
                            <span className="adminBadge">Admin</span>
                          ) : (
                            <span className="userBadge">User</span>
                          )}
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="adminActionsCell">
                          <button
                            className="adminIconBtn edit"
                            onClick={() => handleEditClick(u)}
                            title="Edit User"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            className="adminIconBtn role"
                            onClick={() =>
                              setShowRoleModal({
                                id: u.id,
                                name: u.name,
                                role: u.role,
                                isAdmin: u.is_admin,
                              })
                            }
                            title="Edit Role"
                          >
                            <Edit size={16} />
                          </button>
                          {u.id !== user.id && (
                            <button
                              className="adminIconBtn delete"
                              onClick={() => setShowDeleteConfirm(u.id)}
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Modals remain similar but with updated class names */}
        {showCreateModal && (
          <div
            className="adminModalOverlay"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="adminModalContainer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adminModalHeader">
                <h3>Create New User</h3>
                <button onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="adminModalBody">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <div className="adminPasswordWrapper">
                    <input
                      type={showCreatePassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    style={{
                      backgroundColor: "#2a2a2a",
                      color: "#e0e0e0",
                      border: "1px solid #444444",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <option
                      value="innovator"
                      style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}
                    >
                      Innovator
                    </option>
                    <option
                      value="investor"
                      style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}
                    >
                      Investor
                    </option>
                  </select>
                  <div className="adminCheckboxRow">
                    <span>Add as admin?</span>
                    <label className="adminSwitch">
                      <input
                        type="checkbox"
                        checked={formData.is_admin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_admin: e.target.checked,
                          })
                        }
                      />
                      <span className="adminSwitchSlider"></span>
                    </label>
                  </div>
                </div>
                <div className="adminModalFooter">
                  <button
                    type="button"
                    className="adminModalCancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="adminModalCreate"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRoleModal && (
          <div
            className="adminModalOverlay"
            onClick={() => setShowRoleModal(null)}
          >
            <div
              className="adminModalContainer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adminModalHeader">
                <h3>Update User Role</h3>
                <button onClick={() => setShowRoleModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="adminModalBody">
                <p className="adminModalUserName">User: {showRoleModal.name}</p>
                <select
                  value={showRoleModal.role}
                  onChange={(e) =>
                    setShowRoleModal({ ...showRoleModal, role: e.target.value })
                  }
                >
                  <option value="innovator">Innovator</option>
                  <option value="investor">Investor</option>
                </select>
                <div className="adminCheckboxRow">
                  <span>Add as admin?</span>
                  <label className="adminSwitch">
                    <input
                      type="checkbox"
                      checked={showRoleModal.isAdmin}
                      onChange={(e) =>
                        setShowRoleModal({
                          ...showRoleModal,
                          isAdmin: e.target.checked,
                        })
                      }
                    />
                    <span className="adminSwitchSlider"></span>
                  </label>
                </div>
              </div>
              <div className="adminModalFooter">
                <button
                  className="adminModalCancel"
                  onClick={() => setShowRoleModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="adminModalCreate"
                  onClick={() =>
                    handleUpdateRole(
                      showRoleModal.id,
                      showRoleModal.role,
                      showRoleModal.isAdmin,
                    )
                  }
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div
            className="adminModalOverlay"
            onClick={() => setShowEditModal(null)}
          >
            <div
              className="adminModalContainer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adminModalHeader">
                <h3>Edit User: {showEditModal.name}</h3>
                <button onClick={() => setShowEditModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="adminModalBody">
                <input
                  type="email"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
                <div className="adminPasswordWrapper">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    placeholder="New Password (leave blank to keep current)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
                <div className="adminPasswordWrapper">
                  <input
                    type={showEditConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    disabled={!editPassword}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowEditConfirmPassword(!showEditConfirmPassword)
                    }
                    disabled={!editPassword}
                  >
                    {showEditConfirmPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
                {editError && <p className="adminErrorText">{editError}</p>}
              </div>
              <div className="adminModalFooter">
                <button
                  className="adminModalCancel"
                  onClick={() => setShowEditModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="adminModalCreate"
                  onClick={handleUpdateUser}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm !== null && (
          <div
            className="adminModalOverlay"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="adminModalContainer adminWarningModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adminModalHeader">
                <h3>Delete User</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="adminModalBody">
                <p>Are you sure you want to delete this user?</p>
                <p className="adminModalWarning">
                  This action cannot be undone. All their posts and comments
                  will be permanently deleted.
                </p>
              </div>
              <div className="adminModalFooter">
                <button
                  className="adminModalCancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="adminModalDelete"
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
