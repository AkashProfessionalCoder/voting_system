import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import AnimatedBackgroundLayout from "../components/AnimatedBackgroundLayout";
import ThemeToggle from "../components/ThemeToggle";
import {
  adminLogin,
  getResults,
  getVoters,
  getNominees,
  getDeadline,
  addNominee,
  updateNominee,
  exportVotes,
  setDeadline as setDeadlineApi,
  truncateVotes,
} from "../services/api";

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard data
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [voters, setVoters] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [error, setError] = useState("");

  // Add/Edit nominee form
  const [newNominee, setNewNominee] = useState({
    name: "",
    title: "",
    category: "",
    image: "",
    linkedin: "",
    twitter: "",
    github: "",
  });
  const [addingNominee, setAddingNominee] = useState(false);
  const [editingNomineeId, setEditingNomineeId] = useState(null);

  // Deadline
  const [deadlineInput, setDeadlineInput] = useState("");
  const [currentDeadline, setCurrentDeadline] = useState(null);
  const [deadlineMsg, setDeadlineMsg] = useState("");

  // Truncate votes dialog
  const [showTruncateDialog, setShowTruncateDialog] = useState(false);
  const [truncateConfirmText, setTruncateConfirmText] = useState("");
  const [truncating, setTruncating] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resRes, votersRes, nomRes, dlRes] = await Promise.all([
        getResults(token),
        getVoters(token),
        getNominees(),
        getDeadline(),
      ]);
      setResults(resRes.data.results);
      setTotalVotes(resRes.data.totalVotes);
      setCategoryTotals(resRes.data.categoryTotals || {});
      setVoters(votersRes.data);
      setNominees(nomRes.data);
      if (dlRes.data.deadline) {
        setCurrentDeadline(dlRes.data.deadline);
        // Pre-fill input with current deadline in datetime-local format
        const dl = new Date(dlRes.data.deadline);
        const localISO = new Date(dl.getTime() - dl.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDeadlineInput(localISO);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await adminLogin(username, password);
      const t = res.data.token;
      setToken(t);
      localStorage.setItem("admin_token", t);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsLoggedIn(false);
    localStorage.removeItem("admin_token");
  };

  const handleSaveNominee = async (e) => {
    e.preventDefault();
    if (!newNominee.name || !newNominee.title || !newNominee.category) return;
    setAddingNominee(true);
    try {
      if (editingNomineeId) {
        await updateNominee(editingNomineeId, newNominee, token);
      } else {
        await addNominee(newNominee, token);
      }
      setNewNominee({
        name: "",
        title: "",
        category: "",
        image: "",
        linkedin: "",
        twitter: "",
        github: "",
      });
      setEditingNomineeId(null);
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save nominee.");
    } finally {
      setAddingNominee(false);
    }
  };

  const handleEditClick = (nominee) => {
    setEditingNomineeId(nominee._id);
    setNewNominee({
      name: nominee.name,
      title: nominee.title,
      category: nominee.category,
      image: nominee.image || "",
      linkedin: nominee.linkedin || "",
      twitter: nominee.twitter || "",
      github: nominee.github || "",
    });
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteNominee = async (id, name) => {
    if (!window.confirm(`Delete nominee "${name}"?`)) return;
    try {
      await deleteNominee(id, token);
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete nominee.");
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportVotes(token);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "votes-export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export.");
    }
  };

  const handleTruncate = async () => {
    if (truncateConfirmText !== "DELETE") return;
    setTruncating(true);
    try {
      await truncateVotes(token);
      setShowTruncateDialog(false);
      setTruncateConfirmText("");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError("Failed to truncate votes.");
    } finally {
      setTruncating(false);
    }
  };

  const handleSetDeadline = async () => {
    if (!deadlineInput) return;

    // Confirmation dialog with old vs new date
    const newDate = new Date(deadlineInput).toLocaleString();
    const oldDate = currentDeadline
      ? new Date(currentDeadline).toLocaleString()
      : "Not set";

    const confirmed = window.confirm(
      `Are you sure you want to change the deadline?\n\nCurrent: ${oldDate}\nNew: ${newDate}`,
    );
    if (!confirmed) return;

    setDeadlineMsg("");
    try {
      const res = await setDeadlineApi(deadlineInput, token);
      setCurrentDeadline(res.data.deadline);
      setDeadlineMsg(
        `Deadline updated to: ${new Date(res.data.deadline).toLocaleString()}`,
      );
    } catch (err) {
      setDeadlineMsg(err.response?.data?.error || "Failed to set deadline.");
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <AnimatedBackgroundLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-sm border border-white/40 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Admin Login
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  required
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </AnimatedBackgroundLayout>
    );
  }

  // Dashboard
  // Group results by category (backend already sorts by {category:1, voteCount:-1})
  const resultsByCategory = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});
  const resultCategories = Object.keys(resultsByCategory).sort();

  return (
    <AnimatedBackgroundLayout>
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/40 dark:border-gray-700/50 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Total Votes:{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {totalVotes}
              </strong>
            </span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-xl p-1 mb-6 max-w-lg shadow-sm">
          {[
            { key: "results", label: "Results" },
            { key: "voters", label: "Voters" },
            { key: "nominees", label: "Nominees" },
            { key: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setError("");
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <Loader text="Loading dashboard..." />
        ) : (
          <>
            {/* RESULTS TAB — grouped by category */}
            {activeTab === "results" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Vote Results
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {totalVotes} total vote{totalVotes !== 1 ? "s" : ""} across {resultCategories.length} categor{resultCategories.length !== 1 ? "ies" : "y"}
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>

                {results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No votes yet.</p>
                ) : (
                  resultCategories.map((category) => {
                    const catResults = resultsByCategory[category];
                    const catTotal = categoryTotals[category] || 1;
                    const maxInCat = Math.max(...catResults.map((r) => r.voteCount));
                    return (
                      <div key={category}>
                        {/* Category header */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {category}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
                            {catTotal} vote{catTotal !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {catResults.map((r, idx) => (
                            <div
                              key={r.nomineeId}
                              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 shadow-sm p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {idx === 0 && (
                                    <span className="text-base" title="Category leader">🏆</span>
                                  )}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                      {r.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {r.title}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {r.voteCount}
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(r.voteCount / maxInCat) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {catTotal > 0
                                  ? ((r.voteCount / catTotal) * 100).toFixed(1)
                                  : 0}% of category votes
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* VOTERS TAB */}
            {activeTab === "voters" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    All Voters ({voters.length})
                  </h2>
                  <button
                    onClick={() => setShowTruncateDialog(true)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/30 transition-colors"
                  >
                    Truncate Votes
                  </button>
                </div>
                {voters.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No voters yet.
                  </p>
                ) : (
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-b border-white/40 dark:border-gray-600/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">
                              #
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">
                              Voted For
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {voters.map((v, i) => (
                            <tr
                              key={v._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono text-xs">
                                {v.email}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-400">
                                {v.nomineeId?.name || "Deleted"}
                              </td>
                              <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                                {new Date(v.votedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOMINEES TAB */}
            {activeTab === "nominees" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Manage Nominees
                </h2>

                {/* Add/Edit form */}
                <form
                  onSubmit={handleSaveNominee}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 shadow-sm p-4 mb-6"
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {editingNomineeId ? "Edit Nominee" : "Add New Nominee"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newNominee.name}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, name: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Title / Role"
                      value={newNominee.title}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, title: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newNominee.category}
                      onChange={(e) =>
                        setNewNominee({
                          ...newNominee,
                          category: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={newNominee.image}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, image: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="LinkedIn URL (optional)"
                      value={newNominee.linkedin}
                      onChange={(e) =>
                        setNewNominee({
                          ...newNominee,
                          linkedin: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Twitter/X URL (optional)"
                      value={newNominee.twitter}
                      onChange={(e) =>
                        setNewNominee({
                          ...newNominee,
                          twitter: e.target.value,
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="GitHub URL (optional)"
                      value={newNominee.github}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, github: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={addingNominee}
                      className="mt-3 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {addingNominee
                        ? "Saving..."
                        : editingNomineeId
                          ? "Update Nominee"
                          : "Add Nominee"}
                    </button>
                    {editingNomineeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNomineeId(null);
                          setNewNominee({
                            name: "",
                            title: "",
                            category: "",
                            image: "",
                            linkedin: "",
                            twitter: "",
                            github: "",
                          });
                        }}
                        className="mt-3 px-6 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* List */}
                <div className="space-y-2">
                  {nominees.map((n) => (
                    <div
                      key={n._id}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 shadow-sm p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {n.image ? (
                          <img
                            src={n.image}
                            alt={n.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {n.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {n.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {n.title} &middot; {n.category}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {n.linkedin && (
                              <a
                                href={n.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              </a>
                            )}
                            {n.twitter && (
                              <a
                                href={n.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-white"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </a>
                            )}
                            {n.github && (
                              <a
                                href={n.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-white"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(n)}
                          className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNominee(n._id, n.name)}
                          className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="max-w-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Settings
                </h2>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 shadow-sm p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Voting Deadline
                  </h3>
                  {currentDeadline && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Current deadline:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {new Date(currentDeadline).toLocaleString()}
                      </span>
                    </p>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="datetime-local"
                      value={deadlineInput}
                      onChange={(e) => setDeadlineInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSetDeadline}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Set
                    </button>
                  </div>
                  {deadlineMsg && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      {deadlineMsg}
                    </p>
                  )}
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/50 shadow-sm p-4 mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Quick Actions
                  </h3>
                  <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Truncate Confirmation Dialog */}
      {showTruncateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 dark:border-red-900/50">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold">Danger Zone</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This will permanently delete all votes and clear the leaderboard. This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">
              Type <strong className="text-red-600 dark:text-red-400 select-all">DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={truncateConfirmText}
              onChange={(e) => setTruncateConfirmText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white mb-6 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="DELETE"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTruncateDialog(false);
                  setTruncateConfirmText("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTruncate}
                disabled={truncateConfirmText !== "DELETE" || truncating}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {truncating ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedBackgroundLayout>
  );
}
