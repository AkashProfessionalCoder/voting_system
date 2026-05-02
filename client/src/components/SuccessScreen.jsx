export default function SuccessScreen({ votedCategories = [], onGoHome }) {
  const hasCategories = votedCategories.length > 0;

  return (
    <div className="text-center py-12 px-4">
      {/* Checkmark icon */}
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
        <svg
          className="w-10 h-10 text-green-600 dark:text-green-400"
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

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {hasCategories ? "Votes Recorded!" : "Vote Recorded!"}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        Thank you for participating in the Flutter Chennai Annual Vote. Your
        {hasCategories ? " votes have" : " vote has"} been securely recorded.
      </p>

      {/* Voted categories list */}
      {hasCategories && (
        <div className="mt-6 max-w-sm mx-auto space-y-2">
          {votedCategories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl"
            >
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                ✓
              </span>
              <span className="text-sm font-medium text-green-800 dark:text-green-300 text-left">
                {cat}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-sm mx-auto border border-blue-100 dark:border-blue-800/30">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          One vote is allowed per category per Gmail address. Your votes cannot
          be changed.
        </p>
      </div>

      {onGoHome && (
        <div className="mt-8">
          <button
            onClick={onGoHome}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Return to Home Page
          </button>
        </div>
      )}
    </div>
  );
}
