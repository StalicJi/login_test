"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  return (
    <div className="p-4">
      <h1 className="text-center text-2xl mt-10">
        {username ? username : "測試登入系統"}
      </h1>
    </div>
  );
}
