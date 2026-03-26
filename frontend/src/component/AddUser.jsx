import { useState } from "react";
import axios from "axios";

function AddUser() {

  const [form, setForm] = useState({
    UserName: "",
    Password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("/adduser", form);
      setSuccess("User Added Successfully");
      setForm({ UserName: "", Password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Add User
      </h2>
{error && (
        <div className="bg-red-500/20 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 text-green-700 p-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="UserName"
          placeholder="Enter Username"
          value={form.UserName}
          onChange={handleChange}
          autoComplete="off"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          name="Password"
          placeholder="Enter Password"
          value={form.Password}
          onChange={handleChange}
          autoComplete="off"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add User
        </button>

      </form>
    </div>
  );
}

export default AddUser;