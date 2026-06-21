"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://127.0.0.1:8000/reviewers/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      if (!res.ok) {
        setError("Reviewer not found");
        return;
      }

      const data = await res.json();

      localStorage.setItem(
        "reviewerId",
        data.reviewer_id
      );

      localStorage.setItem(
        "reviewerName",
        data.name
      );

      router.push("/auth/reviewer");
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-[450px] max-w-[90vw]">
        <h1 className="text-3xl font-bold mb-2">
          Reviewer Login
        </h1>

        <p className="text-gray-500 mb-6">
          Enter the email used during reviewer registration.
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#5F7F77] text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}