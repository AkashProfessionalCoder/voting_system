export default function EmailInput({ email, setEmail, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Gmail Address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="yourname@gmail.com"
        className={`
          w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
        `}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      <p className="mt-1.5 text-xs text-gray-400">
        Only @gmail.com addresses are accepted
      </p>
    </div>
  );
}
