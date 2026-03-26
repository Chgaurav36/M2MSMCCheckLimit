import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SMCLimit() {
  const [partyCode, setPartyCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDark(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const getLimit = async () => {
    if (!partyCode) {
      setError("Party Code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch("http://localhost:5000/api/cuid-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partyCode }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message);
      }

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleUpdatePassword = async () => {
    setUpdateMessage("");
    setUpdateError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setUpdateError("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setUpdateError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setUpdateError("New password and confirm password do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateError(data.message || "Unable to update password");
        return;
      }

      setUpdateMessage(data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setUpdateError("Server error while updating password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition">
      
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          💳 CUID Dashboard
        </h1>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Check Available Limit
            </h2>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              Enter party code to fetch data
            </p>
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Enter Party Code"
            value={partyCode}
            onChange={(e) => setPartyCode(e.target.value)}
            className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm mb-3">{error}</div>
          )}

          {/* Button */}
          <button
            onClick={getLimit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition"
          >
            {loading ? "Loading..." : "Get Limit"}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
              
              <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-200">
                <span>Party ID</span>
                <span className="font-medium">{result.PartyId}</span>
              </div>

              <div className="flex justify-between text-lg">
                <span className="text-gray-600 dark:text-gray-300">
                  Available Limit
                </span>
                <span className="font-bold text-green-500">
                  ₹{Number(result.AvailCuidLimit).toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        (result.AvailCuidLimit / 2000000) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Update Password Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Update Password</h3>

            {updateError && (
              <div className="text-red-500 text-sm mb-2">{updateError}</div>
            )}
            {updateMessage && (
              <div className="text-green-500 text-sm mb-2">{updateMessage}</div>
            )}

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleUpdatePassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition"
            >
              Update Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}