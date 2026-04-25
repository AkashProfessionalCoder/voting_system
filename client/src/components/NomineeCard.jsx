import { useState } from "react";

export default function NomineeCard({ nominee, selected, onSelect }) {
  const isSelected = selected === nominee._id;
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={() => onSelect(nominee._id)}
      className={`
        relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer
        hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-sm
        ${
          isSelected
            ? "border-blue-500 dark:border-blue-400 bg-blue-500/15 dark:bg-blue-400/15 shadow-lg ring-2 ring-blue-300/60 dark:ring-blue-400/40"
            : "border-white/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 hover:border-blue-300/60 dark:hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm"
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
        {nominee.image && !imageError ? (
          <img
            src={nominee.image}
            alt={nominee.name}
            onError={() => setImageError(true)}
            className={`w-14 h-14 rounded-full object-cover shrink-0 border-2 ${isSelected ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}`}
          />
        ) : (
          <div
            className={`
          w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0
          ${isSelected ? "bg-blue-500 dark:bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}
        `}
          >
            {nominee.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg truncate">
            {nominee.name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{nominee.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`
              inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
              ${isSelected ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}
            `}
            >
              {nominee.category}
            </span>
            {nominee.linkedin && (
              <a
                href={nominee.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {nominee.twitter && (
              <a
                href={nominee.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {nominee.github && (
              <a
                href={nominee.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
