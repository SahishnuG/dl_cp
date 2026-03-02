export default function CandidateReport({ candidate }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">{candidate.name}</h2>

      <p><strong>Classification:</strong> {candidate.classification}</p>
      <p><strong>Match Score:</strong> {candidate.score}%</p>

      <div className="mt-4">
        <h3 className="font-semibold">Strengths</h3>
        <ul className="list-disc ml-6">
          {candidate.strengths.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Weaknesses</h3>
        <ul className="list-disc ml-6">
          {candidate.weaknesses.map((w: string, i: number) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}