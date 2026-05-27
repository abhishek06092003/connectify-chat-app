import { useState } from "react";
import axios from "axios";

function Login({ setIsAuthenticated, setUsername }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        }
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save username
      localStorage.setItem(
        "username",
        res.data.user.username
      );

      setUsername(res.data.user.username);

      setIsAuthenticated(true);

    } catch (error) {

      alert(error.response.data.message);

    }

  };

  return (

    <div className="bg-gray-100 h-screen flex justify-center items-center">

      <div className="bg-white p-10 rounded-xl shadow-lg w-96">

        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={loginUser}
          className="w-full bg-green-500 text-white p-3 rounded-lg"
        >
          Login
        </button>

      </div>

    </div>

  );

}

export default Login;