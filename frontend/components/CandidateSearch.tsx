"use client";

import { useState } from "react";
import CandidateReport from "./CandidateReport";

export default function CandidateSearch() {
  const [candidateId, setCandidateId] = useState("");
  const [candidate, setCandidate] = useState<any>(null);

  const handleSearch = async () => {
    // Replace with real API call
    const mockData = {
      id: candidateId,
      name: "Rahul Sharma",
      classification: "Strong Fit",
      score: 87,
      strengths: ["Python", "ML", "Leadership"],
      weaknesses: ["Cloud Deployment"],
    };

    setCandidate(mockData);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-64"
          placeholder="Enter Candidate ID"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Search
        </button>
      </div>

      {candidate && <CandidateReport candidate={candidate} />}
    </div>
  );
}