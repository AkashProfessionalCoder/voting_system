export default function SuccessScreen() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Recorded!</h2>
      <p className="text-gray-500 max-w-sm mx-auto">
        Thank you for participating in the Flutter Chennai Annual Vote. Your
        vote has been securely recorded.
      </p>
      <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-sm mx-auto">
        <p className="text-sm text-blue-700">
          Each email address can only vote once. Your vote cannot be changed.
        </p>
      </div>
    </div>
  );
}
