export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}
