export default function EmailInput({ email, setEmail, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Gmail Address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="yourname@gmail.com"
        className={`
          w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
          ${error ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/30" : "border-gray-300 dark:border-gray-600"}
        `}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        Only @gmail.com addresses are accepted
      </p>
    </div>
  );
}
