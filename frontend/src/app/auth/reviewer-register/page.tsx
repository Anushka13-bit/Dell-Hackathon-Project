"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reviewerId, setReviewerId] = useState("");

  const handleRegister = async () => {
    if (!resume) {
      alert("Please upload a resume");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append(
        "primary_specialization",
        specialization
      );
      formData.append("file", resume);

      const res = await fetch(
        "http://127.0.0.1:8000/reviewers/register",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      const data = await res.json();
      setReviewerId(data.reviewer_id);

      localStorage.setItem(
        "reviewerId",
        data.reviewer_id
      );

      localStorage.setItem(
        "reviewerName",
        data.name
      );

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F3] to-[#EFE8E5] px-4">
    <div className="bg-white p-10 rounded-3xl shadow-xl w-[550px]">
      <h1 className="text-4xl font-bold mb-3">
        Reviewer Registration
      </h1>

      <p className="text-gray-500 mb-8">
        Upload your resume and we'll automatically
        analyze your expertise areas for reviewer
        assignment and skill matching.
      </p>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-xl p-4 mb-4"
      />

      <input
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-xl p-4 mb-4"
      />

      <input
        placeholder="Primary Specialization"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        className="w-full border rounded-xl p-4 mb-6"
      />

      <div className="mb-8">
        <label className="block text-sm font-semibold mb-2">
          Upload Resume (PDF)
        </label>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            setResume(
              e.target.files
                ? e.target.files[0]
                : null
            )
          }
          className="w-full border rounded-xl p-3 bg-white"
        />

        <p className="text-sm text-gray-500 mt-2">
          Resume parsing will extract skills,
          experience and specialization areas.
        </p>

        {resume && (
          <div className="mt-3 text-green-700 text-sm font-medium">
            ✓ {resume.name}
          </div>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-[#5F7F77] hover:bg-[#4E6B64] text-white py-4 rounded-xl font-semibold transition"
      >
        {loading
          ? "Analyzing Resume..."
          : "Register & Analyze Resume"}
      </button>
    </div>

    {success && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 w-[450px] text-center shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">
            Registration Successful
          </h2>

          <p className="text-gray-600 mb-6">
            Your reviewer account has been created
            successfully.

            <br />
            <br />

            Resume parsing has started in the
            background and your skills will be
            extracted automatically.
          </p>

          <button
            onClick={() =>
              router.push("/auth/reviewer")
            }
            className="w-full bg-[#5F7F77] text-white py-3 rounded-xl"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )}
  </div>
);
}