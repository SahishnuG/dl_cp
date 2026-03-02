import DashboardStats from "@/components/DashboardStats";
import ResumeChart from "@/components/ResumeChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <ResumeChart />
    </div>
  );
}