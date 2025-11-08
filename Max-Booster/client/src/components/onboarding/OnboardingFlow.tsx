interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Max Booster!</h1>
        <button onClick={onComplete} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Complete</button>
        <button onClick={onSkip} className="bg-gray-300 px-4 py-2 rounded">Skip</button>
      </div>
    </div>
  );
}
