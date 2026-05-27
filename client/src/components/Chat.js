import { useEffect, useState } from "react";

import axios from "axios";

import EmojiPicker from "emoji-picker-react";

import socket from "../socket/socket";

function Chat({ username, logout }) {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [typing, setTyping] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [image, setImage] =
    useState(null);

  // Load messages + socket events
  useEffect(() => {

    // Join user
    socket.emit("join", username);

    // Fetch old messages
    const fetchMessages = async () => {

      const res = await axios.get(
        "http://localhost:5000/messages"
      );

      setMessages(res.data);

    };

    fetchMessages();

    // Receive realtime messages
    socket.on("receive_message", (data) => {

      setMessages((prev) => {

        const alreadyExists = prev.some(
          (msg) =>
            msg.text === data.text &&
            msg.image === data.image &&
            msg.username === data.username
        );

        if (alreadyExists) return prev;

        return [...prev, data];

      });

    });

    // Typing
    socket.on("show_typing", (data) => {

      setTyping(data);

      setTimeout(() => {

        setTyping("");

      }, 2000);

    });

    // Online users
    socket.on("online_users", (users) => {

      setOnlineUsers(users);

    });

    return () => {

      socket.off("receive_message");

      socket.off("show_typing");

      socket.off("online_users");

    };

  }, [username]);

  // Send Message
  const sendMessage = () => {

    if (
      message.trim() === "" &&
      !image
    ) return;

    const messageData = {

      username,

      text: message,

      image: image || "",

    };

    socket.emit(
      "send_message",
      messageData
    );

    // Instant local update
    setMessages((prev) => [
      ...prev,
      messageData,
    ]);

    setMessage("");

    setImage(null);

  };

  // Typing
  const handleTyping = () => {

    socket.emit(
      "typing",
      `${username} is typing...`
    );

  };

  // Emoji
  const onEmojiClick = (emojiData) => {

    setMessage(
      (prev) => prev + emojiData.emoji
    );

  };

  // Image Upload
  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {

      setImage(reader.result);

    };

  };

  return (

    <div
      className={`h-screen flex justify-center items-center ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >

      <div
        className={`w-full max-w-2xl h-[90vh] rounded-xl shadow-lg flex flex-col ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white"
        }`}
      >

        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-xl flex justify-between items-center">

          <h2 className="font-bold text-xl">
            Connectify
          </h2>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="bg-white text-black px-3 py-1 rounded-lg text-sm"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <p>{username}</p>

            <button
              onClick={logout}
              className="bg-white text-green-500 px-3 py-1 rounded-lg text-sm"
            >
              Logout
            </button>

          </div>

        </div>

        {/* Online Users */}
        <div
          className={`p-3 border-b ${
            darkMode
              ? "bg-gray-800"
              : "bg-gray-50"
          }`}
        >

          <h3 className="font-bold mb-2">
            Online Users
          </h3>

          <div className="flex gap-2 flex-wrap">

            {onlineUsers.map((user, index) => (

              <div
                key={index}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
              >
                🟢 {user.username}
              </div>

            ))}

          </div>

        </div>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-4 ${
            darkMode
              ? "bg-gray-900"
              : "bg-gray-100"
          }`}
        >

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`mb-3 flex ${
                msg.username === username
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`p-3 rounded-xl max-w-xs ${
                  msg.username === username
                    ? "bg-green-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white"
                }`}
              >

                <p className="text-sm font-bold">
                  {msg.username}
                </p>

                {/* Text */}
                {msg.text && (
                  <p>{msg.text}</p>
                )}

                {/* Image */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="shared"
                    className="mt-2 rounded-lg w-full"
                  />
                )}

              </div>

            </div>

          ))}

          {/* Typing */}
          <p className="text-gray-500 text-sm">
            {typing}
          </p>

        </div>

        {/* Input */}
        <div className="p-4 flex gap-2 border-t items-center">

          {/* File Upload */}
          <label className="cursor-pointer text-2xl">

            📎

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />

          </label>

          {/* Emoji */}
          <div className="relative">

            <button
              onClick={() =>
                setShowEmojiPicker(
                  !showEmojiPicker
                )
              }
              className="text-2xl"
            >
              😄
            </button>

            {showEmojiPicker && (

              <div className="absolute bottom-12 left-0 z-10">

                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                />

              </div>

            )}

          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => {

              setMessage(e.target.value);

              handleTyping();

            }}
            className="flex-1 border rounded-full px-4 py-2 outline-none text-black"
          />

          {/* Send */}
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600"
          >
            Send
          </button>

        </div>

      </div>

    </div>

  );

}

export default Chat;