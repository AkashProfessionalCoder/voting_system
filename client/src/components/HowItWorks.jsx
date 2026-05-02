const steps = [
  {
    number: 1,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
    title: "Browse by Category",
    description: "Explore nominees organized across all award categories — Community Impact, Open Source, Technical Leadership, and more.",
    accent: "from-violet-500 to-purple-600",
    glow: "shadow-violet-200 dark:shadow-violet-900/40",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-100 dark:border-violet-800/40",
    tag: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  },
  {
    number: 2,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Pick One Per Category",
    description: "Select your favourite nominee from each category. You can vote in as many categories as you like — one pick per category.",
    accent: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-200 dark:shadow-blue-900/40",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-100 dark:border-blue-800/40",
    tag: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  },
  {
    number: 3,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    ),
    title: "Enter Your Gmail",
    description: "Only @gmail.com addresses are accepted. Your email is used solely to ensure each person votes once per category.",
    accent: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-200 dark:shadow-emerald-900/40",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/40",
    tag: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  {
    number: 4,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Verify with OTP",
    description: "A 6-digit one-time password is sent to your Gmail inbox. Enter it to confirm your identity — it expires in 5 minutes.",
    accent: "from-orange-500 to-amber-500",
    glow: "shadow-orange-200 dark:shadow-orange-900/40",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-100 dark:border-orange-800/40",
    tag: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  },
  {
    number: 5,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: "Submit Your Votes",
    description: "All your category selections are submitted at once, securely. Each vote is recorded on our server and cannot be changed.",
    accent: "from-pink-500 to-rose-500",
    glow: "shadow-pink-200 dark:shadow-pink-900/40",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-100 dark:border-pink-800/40",
    tag: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  },
  {
    number: 6,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "One Vote Per Category",
    description: "You may vote in multiple categories, but only once per category. Re-attempting to vote in the same category will be rejected.",
    accent: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-200 dark:shadow-indigo-900/40",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-100 dark:border-indigo-800/40",
    tag: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
  },
];

export default function HowItWorks() {
  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wider uppercase">
            Voting Guide
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          How Voting Works
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Cast your vote in just a few steps — secure, transparent, and limited to one Gmail address per category.
        </p>
      </div>

      {/* Step cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className={`
              group relative rounded-2xl border p-5 transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg
              ${step.bg} ${step.border} ${step.glow}
              backdrop-blur-sm
            `}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Connector line (hidden on mobile, shown via grid layout) */}

            <div className="flex items-start gap-4">
              {/* Gradient number badge */}
              <div
                className={`
                  shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${step.accent} text-white shadow-md
                  group-hover:scale-110 transition-transform duration-300
                `}
              >
                {step.icon}
              </div>

              <div className="min-w-0 flex-1">
                {/* Step number tag */}
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-1.5 ${step.tag}`}>
                  Step {step.number}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom rule / divider with tagline */}
      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-medium">
          🔒 OTP-secured · One vote per category per Gmail
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      </div>
    </section>
  );
}
