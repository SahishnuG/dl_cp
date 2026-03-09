"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";

async function parseJsonSafely<T>(response: Response): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    const snippet = raw.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(`Expected JSON response, got: ${snippet || "<empty response>"}`);
  }
}

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [interviewVideo, setInterviewVideo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const { isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      router.push("/candidate-login");
      return;
    }

    const displayName = user?.username || "User";
    setUserName(displayName);
  }, [isLoaded, userId, user, router]);

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

  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/x-m4v",
  ];

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");

    if (e.target.files && e.target.files[0]) {
      const selectedVideo = e.target.files[0];
      const extension = selectedVideo.name.split(".").pop()?.toLowerCase() || "";
      const allowedVideoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "m4v"];
      if (allowedVideoTypes.includes(selectedVideo.type) || allowedVideoExtensions.includes(extension)) {
        setInterviewVideo(selectedVideo);
      } else {
        setError("Invalid video type. Please upload MP4, MOV, AVI, MKV, WEBM, or M4V files.");
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
      if (!userId) {
        throw new Error("Authentication required");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("file", file);
      if (interviewVideo) {
        formData.append("interview_video", interviewVideo);
      }

      const response = await fetch(`${apiUrl}/api/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      const data = await parseJsonSafely<{ detail?: string }>(response);

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      // Redirect to analysis page after successful upload
      router.push("/analysis");
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        setError(
          `Cannot reach backend API at ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}. Ensure backend is running and accessible.`
        );
      } else {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] py-6">
      <div className="ambient-blob left-[-14%] top-[-12%] h-[520px] w-[680px] bg-[radial-gradient(circle,rgba(94,106,210,0.23),transparent_70%)]" />
      <div className="ambient-blob right-[-16%] bottom-[-20%] h-[560px] w-[760px] bg-[radial-gradient(circle,rgba(104,114,217,0.15),transparent_70%)] [animation-delay:1.4s]" />

      <div className="relative mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-mono mb-2">Candidate Workspace</p>
            <h1 className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
              Upload Your Resume
            </h1>
            <p className="mt-2 text-[var(--foreground-muted)]">Welcome back, {userName}</p>
          </div>
          <button onClick={handleLogout} className="ui-btn-secondary px-4 py-2 text-sm">
            Logout
          </button>
        </div>

        <section className="ui-card p-6 sm:p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-12 transition-all duration-300 ${
              dragActive
                ? "border-[var(--accent)] bg-[rgba(94,106,210,0.12)]"
                : "border-white/25 bg-white/5 hover:border-[var(--accent)]"
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
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-semibold tracking-wide text-[var(--foreground)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                DOC
              </div>

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-[var(--foreground)]">{file.name}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm font-medium text-rose-300 transition-colors hover:text-rose-200"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-medium text-[var(--foreground)]">Drag and drop your resume here, or</p>
                    <label
                      htmlFor="file-upload"
                      className="ui-btn-primary mt-2 inline-flex cursor-pointer px-6 py-2 text-sm"
                    >
                      Browse Files
                    </label>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">Supported formats: PDF, PNG, JPG, BMP, WEBP, TXT, DOCX</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 text-sm font-semibold text-[var(--foreground)]">Optional Interview Video</p>
            <p className="mb-3 text-xs text-[var(--foreground-muted)]">Supported formats: MP4, MOV, AVI, MKV, WEBM, M4V</p>

            <input
              type="file"
              id="video-upload"
              onChange={handleVideoChange}
              accept=".mp4,.mov,.avi,.mkv,.webm,.m4v,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/x-m4v"
              className="hidden"
            />

            {interviewVideo ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{interviewVideo.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{(interviewVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInterviewVideo(null)}
                  className="text-xs font-medium text-rose-300 transition-colors hover:text-rose-200"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="video-upload"
                className="ui-btn-secondary inline-flex cursor-pointer px-4 py-2 text-sm"
              >
                Select Video
              </label>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="ui-btn-primary mt-6 w-full py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading and Analyzing...
              </span>
            ) : (
              "Upload and Analyze Resume"
            )}
          </button>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="ui-card p-6">
            <div className="mb-3 text-xs font-semibold tracking-[0.18em] text-[var(--foreground-subtle)]">FAST</div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">Instant Analysis</h3>
            <p className="text-sm text-[var(--foreground-muted)]">Get AI-powered insights about your resume in seconds</p>
          </div>
          <div className="ui-card p-6">
            <div className="mb-3 text-xs font-semibold tracking-[0.18em] text-[var(--foreground-subtle)]">SCORE</div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">Detailed Scoring</h3>
            <p className="text-sm text-[var(--foreground-muted)]">Ethical, integrity, retention, and alignment scoring</p>
          </div>
          <div className="ui-card p-6">
            <div className="mb-3 text-xs font-semibold tracking-[0.18em] text-[var(--foreground-subtle)]">MATCH</div>
            <h3 className="mb-2 font-semibold text-[var(--foreground)]">Smart Feedback</h3>
            <p className="text-sm text-[var(--foreground-muted)]">Explainability insights and classification summary</p>
          </div>
        </div>
      </div>
    </div>
  );
}
