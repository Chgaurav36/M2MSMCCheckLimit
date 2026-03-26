import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isLogin
      ? "http://localhost:5000/login"
      : "http://localhost:5000/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user || {}));
      localStorage.setItem("token", data.token || "");
      
      if (isLogin) {
        navigate("/smclimit");
      } else {
        setError("");
        setForm({ fullName: "", password: "" });
        setIsLogin(true);
      }

    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">

      {/* Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md transition-all duration-500">

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-200 p-2 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="fullName"
            placeholder="UserName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="off"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="off"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:scale-105 transition transform disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-white mt-6 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="ml-2 font-semibold underline"
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}