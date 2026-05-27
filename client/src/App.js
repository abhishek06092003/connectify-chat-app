import { useEffect, useState } from "react";

import Chat from "./components/Chat";

import Login from "./pages/Login";

import Register from "./pages/Register";

function App() {

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [showRegister, setShowRegister] =
    useState(false);

  const [username, setUsername] =
    useState("");

  // Auto Login
  useEffect(() => {

    const token =
      localStorage.getItem("token");

    const savedUsername =
      localStorage.getItem("username");

    if (token && savedUsername) {

      setIsAuthenticated(true);

      setUsername(savedUsername);

    }

  }, []);

  // Logout
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    setIsAuthenticated(false);

    setUsername("");

  };

  if (!isAuthenticated) {

    return showRegister ? (

      <div>

        <Register />

        <p
          onClick={() => setShowRegister(false)}
          className="text-center mt-4 cursor-pointer text-blue-500"
        >
          Already have an account? Login
        </p>

      </div>

    ) : (

      <div>

        <Login
          setIsAuthenticated={setIsAuthenticated}
          setUsername={setUsername}
        />

        <p
          onClick={() => setShowRegister(true)}
          className="text-center mt-4 cursor-pointer text-blue-500"
        >
          Don't have an account? Register
        </p>

      </div>

    );

  }

  return (

    <Chat
      username={username}
      logout={logout}
    />

  );

}

export default App;