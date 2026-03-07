"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    const name = localStorage.getItem("user_name");
    
    if (!token) {
      router.push("/candidate-login");
      return;
    }
    
    setUserName(name || localStorage.getItem("user_email") || "");
  }, [router]);

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/bmp",
    "image/webp",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const getFileExtension = (filename: string) => {
    return filename.slice(filename.lastIndexOf("."));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        setError(
          "Invalid file type. Please upload PDF, images (PNG, JPG, BMP, WEBP), TXT, or DOCX files."
        );
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        setError(
          "Invalid file type. Please upload PDF, images (PNG, JPG, BMP, WEBP), TXT, or DOCX files."
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("access_token");

      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("candidate_id", userId);

      const response = await fetch("http://localhost:8000/api/upload-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      // Success - show analysis or redirect
      alert("Resume uploaded successfully! Analysis: " + JSON.stringify(data.analysis, null, 2));
      
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with User Info */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Upload Your Resume
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Welcome back, {userName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
              dragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleChange}
              accept=".pdf,.png,.jpg,.jpeg,.bmp,.webp,.txt,.docx"
              className="hidden"
            />

            <div className="text-center space-y-4">
              {/* Upload Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-800 text-5xl">
                📄
              </div>

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-sm font-medium transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Drag and drop your resume here, or
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="mt-2 inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Browse Files
                    </label>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Supported formats: PDF, PNG, JPG, BMP, WEBP, TXT, DOCX
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-rose-600 dark:text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading & Analyzing...
              </span>
            ) : (
              "Upload and Analyze Resume"
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Instant Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get AI-powered insights about your resume in seconds
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Detailed Scoring
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Technical, cultural, and growth potential scores
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Smart Feedback
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Strengths, weaknesses, and classifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
