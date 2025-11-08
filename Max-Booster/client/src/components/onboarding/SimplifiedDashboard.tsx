interface SimplifiedDashboardProps {
  onUpgrade: () => void;
  userLevel: string;
}

export default function SimplifiedDashboard({ onUpgrade, userLevel }: SimplifiedDashboardProps) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Simplified Dashboard ({userLevel})</h1>
      <button onClick={onUpgrade} className="bg-blue-600 text-white px-4 py-2 rounded">
        Upgrade to Full Mode
      </button>
    </div>
  );
}
