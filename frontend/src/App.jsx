import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./pages/SignUp";
import SMCLimit from "./pages/SMCLimit";

function App() {
  const [users, setUsers] = useState([]);
  const [css, setCss] = useState({});
  

  useEffect(() => {
    axios
      .get("/user")
      .then((res) => {
        //console.log("Users data:", res.data);

        // If API returns array-of-arrays → flatten
        const flatUsers = Array.isArray(res.data[0])
          ? res.data.flat()
          : res.data;

        setUsers(flatUsers);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });

    
  }, []);



useEffect(() => {
  axios.get("/css")
    .then((res) => {
      console.log("API Response:", res.data);
      setCss(res.data?.[0] ?? {});
    })
    .catch((err) => {
      console.error("API Error:", err);
    });
}, []);

return(
  <Router>
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/smclimit" element={<SMCLimit />} />
    </Routes>
  </Router>
)


//   return (
//     <>
//     <button
//           type="submit"
//           className={css.username}
//         >
//           Add User
//         </button>
//     <AddUser/>
//     <div className="container w-full min-h-screen p-10">
//       <h1 className="text-4xl font-bold text-center mb-8">
//         Welcome to Money2Me
//       </h1>

//       {users.length > 0 ? (
//   <div className="overflow-x-auto mt-10 px-10">
//     <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
      
//       {/* Header */}
//       <thead className="bg-blue-600 text-white border">
//         <tr>
//           <th className="py-3 px-6 text-left">User ID</th>
//           <th className="py-3 px-6 text-left">User Name</th>
//           <th className="py-3 px-6 text-left">Password</th>
//         </tr>
//       </thead>

//       {/* Body */}
//       <tbody className="text-gray-700">
//         {users.map((user, index) => (
//           <tr
//             key={user.UserID}
//             className={`border hover:bg-blue-50 transition ${
//               index % 2 === 0 ? "bg-gray-100" : "bg-white"
//             }`}
//           >
//             <td className="py-3 px-6">{user.UserID}</td>
//             <td className="py-3 px-6 font-medium">
//               {user.UserName}
//             </td>
//             <td className="py-3 px-6 text-red-500">
//               {user.Password}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// ) : (
//   <p className="text-center mt-10 text-gray-500 text-lg">
//     Loading...
//   </p>
// )}
//     </div>
    
//     </>
//   );
}

export default App;
