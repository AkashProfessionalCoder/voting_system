export default function NomineeCard({ nominee, selected, onSelect }) {
  const isSelected = selected === nominee._id;

  return (
    <button
      onClick={() => onSelect(nominee._id)}
      className={`
        relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:-translate-y-0.5
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
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
      )}

      <div className="flex items-center gap-4">
        <div
          className={`
          w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0
          ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}
        `}
        >
          {nominee.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {nominee.name}
          </h3>
          <p className="text-gray-500 text-sm truncate">{nominee.title}</p>
          <span
            className={`
            inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
            ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}
          `}
          >
            {nominee.category}
          </span>
        </div>
      </div>
    </button>
  );
}
