import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import {
  adminLogin,
  getResults,
  getVoters,
  getNominees,
  addNominee,
  deleteNominee,
  exportVotes,
  setDeadline as setDeadlineApi,
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
  const [voters, setVoters] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [error, setError] = useState("");

  // Add nominee form
  const [newNominee, setNewNominee] = useState({
    name: "",
    title: "",
    category: "",
    image: "",
  });
  const [addingNominee, setAddingNominee] = useState(false);

  // Deadline
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineMsg, setDeadlineMsg] = useState("");

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resRes, votersRes, nomRes] = await Promise.all([
        getResults(token),
        getVoters(token),
        getNominees(),
      ]);
      setResults(resRes.data.results);
      setTotalVotes(resRes.data.totalVotes);
      setVoters(votersRes.data);
      setNominees(nomRes.data);
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

  const handleAddNominee = async (e) => {
    e.preventDefault();
    if (!newNominee.name || !newNominee.title || !newNominee.category) return;
    setAddingNominee(true);
    try {
      await addNominee(newNominee, token);
      setNewNominee({ name: "", title: "", category: "", image: "" });
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add nominee.");
    } finally {
      setAddingNominee(false);
    }
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

  const handleSetDeadline = async () => {
    if (!deadlineInput) return;
    setDeadlineMsg("");
    try {
      const res = await setDeadlineApi(deadlineInput, token);
      setDeadlineMsg(`Deadline set to: ${res.data.deadline}`);
    } catch (err) {
      setDeadlineMsg(err.response?.data?.error || "Failed to set deadline.");
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {loginError && <p className="text-sm text-red-600">{loginError}</p>}

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
    );
  }

  // Dashboard
  const maxVotes = results.length
    ? Math.max(...results.map((r) => r.voteCount))
    : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Total Votes:{" "}
              <strong className="text-gray-900">{totalVotes}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-lg">
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
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <Loader text="Loading dashboard..." />
        ) : (
          <>
            {/* RESULTS TAB */}
            {activeTab === "results" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Vote Results
                  </h2>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                {results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No votes yet.
                  </p>
                ) : (
                  results.map((r) => (
                    <div
                      key={r.nomineeId}
                      className="bg-white rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {r.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {r.title} &middot; {r.category}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {r.voteCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(r.voteCount / maxVotes) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {totalVotes > 0
                          ? ((r.voteCount / totalVotes) * 100).toFixed(1)
                          : 0}
                        % of total
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VOTERS TAB */}
            {activeTab === "voters" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  All Voters ({voters.length})
                </h2>
                {voters.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No voters yet.
                  </p>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
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
                        <tbody className="divide-y divide-gray-100">
                          {voters.map((v, i) => (
                            <tr key={v._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-400">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                                {v.email}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {v.nomineeId?.name || "Deleted"}
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Nominees
                </h2>

                {/* Add form */}
                <form
                  onSubmit={handleAddNominee}
                  className="bg-white rounded-xl border border-gray-200 p-4 mb-6"
                >
                  <h3 className="font-medium text-gray-900 mb-3">
                    Add New Nominee
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newNominee.name}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, name: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Title / Role"
                      value={newNominee.title}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, title: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={newNominee.image}
                      onChange={(e) =>
                        setNewNominee({ ...newNominee, image: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingNominee}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {addingNominee ? "Adding..." : "Add Nominee"}
                  </button>
                </form>

                {/* List */}
                <div className="space-y-2">
                  {nominees.map((n) => (
                    <div
                      key={n._id}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{n.name}</h4>
                        <p className="text-sm text-gray-500">
                          {n.title} &middot; {n.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNominee(n._id, n.name)}
                        className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="max-w-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Settings
                </h2>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Voting Deadline
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="datetime-local"
                      value={deadlineInput}
                      onChange={(e) => setDeadlineInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSetDeadline}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Set
                    </button>
                  </div>
                  {deadlineMsg && (
                    <p className="mt-2 text-sm text-green-600">{deadlineMsg}</p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Quick Actions
                  </h3>
                  <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
