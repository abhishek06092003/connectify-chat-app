import { useState } from "react";
import axios from "axios";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {

    try {

      await axios.post(
        "http://localhost:5000/register",
        {
          username,
          email,
          password,
        }
      );

      alert("User Registered");

    } catch (error) {

      alert(error.response.data.message);

    }

  };

  return (

    <div className="bg-gray-100 h-screen flex justify-center items-center">

      <div className="bg-white p-10 rounded-xl shadow-lg w-96">

        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

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
          onClick={registerUser}
          className="w-full bg-green-500 text-white p-3 rounded-lg"
        >
          Register
        </button>

      </div>

    </div>

  );

}

export default Register;