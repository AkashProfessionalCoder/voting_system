import { useState, useEffect } from "react";
import NomineeCard from "../components/NomineeCard";
import EmailInput from "../components/EmailInput";
import OtpInput from "../components/OtpInput";
import SuccessScreen from "../components/SuccessScreen";
import Loader from "../components/Loader";
import AnimatedBackgroundLayout from "../components/AnimatedBackgroundLayout";
import ThemeToggle from "../components/ThemeToggle";
import HowItWorks from "../components/HowItWorks";
import {
  getNominees,
  getDeadline,
  requestOtp,
  verifyOtp,
  castVotes,
  checkVoteStatus,
} from "../services/api";

const STEPS = {
  SELECT: "select",
  EMAIL: "email",
  OTP: "otp",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  PARTIAL: "partial",
};

export default function VotingPage() {
  const [nominees, setNominees] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.SELECT);

  // Per-category selection: { [category]: nomineeId }
  const [selectedNominees, setSelectedNominees] = useState({});

  // Form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Error / loading states
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Voted categories list shown on success screen
  const [votedCategories, setVotedCategories] = useState([]);

  // Partial failure messages surfaced to the voter
  const [partialErrors, setPartialErrors] = useState([]);

  // Fetch nominees + deadline on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nomRes, dlRes] = await Promise.all([
          getNominees(),
          getDeadline(),
        ]);
        setNominees(nomRes.data);
        setDeadline(dlRes.data.deadline);
      } catch {
        setError("Failed to load nominees. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // OTP resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const isDeadlinePassed = deadline && new Date() > new Date(deadline);

  // Group nominees by category (sorted alphabetically)
  const grouped = nominees.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = [];
    acc[n.category].push(n);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  const selectedCount = Object.keys(selectedNominees).length;
  const totalCategories = categories.length;

  // Toggle: clicking the already-selected nominee deselects it
  const handleSelectNominee = (nomineeId, category) => {
    setSelectedNominees((prev) => {
      if (prev[category] === nomineeId) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: nomineeId };
    });
    setError("");
  };

  const handleProceedToEmail = () => {
    if (selectedCount === 0) {
      setError("Please select at least one nominee before continuing.");
      return;
    }
    setError("");
    setStep(STEPS.EMAIL);
  };

  const handleRequestOtp = async () => {
    setFieldError("");
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setFieldError("Email is required.");
      return;
    }
    if (!/^[a-zA-Z0-9.\+]+@gmail\.com$/.test(trimmed)) {
      setFieldError("Only @gmail.com addresses are allowed.");
      return;
    }

    setSubmitting(true);
    try {
      // Pre-validation: check if already voted in any selected categories
      const statusRes = await checkVoteStatus(trimmed);
      const pastVotes = statusRes.data.votes || {};
      
      const alreadyVotedCats = Object.keys(selectedNominees).filter(
        (cat) => pastVotes[cat]
      );
      
      if (alreadyVotedCats.length > 0) {
        const catNames = alreadyVotedCats.map((c) => `"${c}"`).join(", ");
        setError(`You have already voted in the ${catNames} categor${alreadyVotedCats.length > 1 ? 'ies' : 'y'}. Please go back and deselect ${alreadyVotedCats.length > 1 ? 'them' : 'it'} to continue.`);
        setSubmitting(false);
        return;
      }

      await requestOtp(trimmed);
      setCountdown(60);
      setError(""); // clear any pre-validation warnings before showing OTP screen
      setStep(STEPS.OTP);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send OTP.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndVote = async () => {
    setFieldError("");
    setError("");

    if (otp.length !== 6) {
      setFieldError("Please enter the complete 6-digit OTP.");
      return;
    }

    setSubmitting(true);
    let submittingVotes = false;
    try {
      // Step 1: Verify OTP → get short-lived JWT
      const verifyRes = await verifyOtp(email.trim().toLowerCase(), otp);
      const voteToken = verifyRes.data.token;

      // Step 2: Send ALL selections in one batch request
      submittingVotes = true;
      setStep(STEPS.SUBMITTING);

      const nomineeIds = Object.values(selectedNominees); // [nomineeId, ...]
      const categories = Object.keys(selectedNominees);   // [category, ...]

      const voteRes = await castVotes(nomineeIds, voteToken);
      const recordedCategories = voteRes.data.categories || categories;

      setVotedCategories(recordedCategories);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed.";
      setError(msg);
      setStep(submittingVotes ? STEPS.OTP : STEPS.OTP);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setOtp("");
    setSubmitting(true);
    try {
      await requestOtp(email.trim().toLowerCase());
      setCountdown(60);
      setOtp("");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to resend OTP.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setError("");
    setFieldError("");
    if (step === STEPS.OTP) setStep(STEPS.EMAIL);
    else if (step === STEPS.EMAIL) setStep(STEPS.SELECT);
  };

  if (loading) return <Loader text="Loading nominees..." />;

  if (!loading && isDeadlinePassed) {
    return (
      <AnimatedBackgroundLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md text-center border border-white/20 dark:border-gray-700/50">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Voting Has Ended
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              The voting deadline has passed. Thank you for your interest!
            </p>
          </div>
        </div>
      </AnimatedBackgroundLayout>
    );
  }

  return (
    <AnimatedBackgroundLayout>
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/40 dark:border-gray-700/50 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Flutter Chennai
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Annual Community Vote 2026
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          {deadline && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Voting ends: {new Date(deadline).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Select", "Email", "OTP", "Done"].map((label, i) => {
            const stepIndex = [
              STEPS.SELECT,
              STEPS.EMAIL,
              STEPS.OTP,
              STEPS.SUCCESS,
            ].indexOf(step);
            const isActive =
              i <= stepIndex || (step === STEPS.SUBMITTING && i <= 2);
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}
                `}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm hidden sm:block ${isActive ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {label}
                </span>
                {i < 3 && (
                  <div
                    className={`w-8 h-0.5 ${isActive ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Global error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {step === STEPS.SUCCESS && (
          <SuccessScreen
            votedCategories={votedCategories}
            onGoHome={() => window.location.reload()}
          />
        )}

        {/* PARTIAL SUCCESS */}
        {step === STEPS.PARTIAL && (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Partially Recorded</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Some votes were saved, but the following categories could not be recorded:
            </p>
            {votedCategories.length > 0 && (
              <div className="mb-4 max-w-sm mx-auto space-y-2">
                {votedCategories.map((cat) => (
                  <div key={cat} className="flex items-center gap-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl">
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">{cat}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="max-w-sm mx-auto space-y-2 mb-6">
              {partialErrors.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-left">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold mt-0.5">✕</span>
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">{msg}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Return to Home Page
            </button>
          </div>
        )}

        {/* SUBMITTING */}
        {step === STEPS.SUBMITTING && (
          <Loader text="Recording your votes..." />
        )}

        {/* SELECT NOMINEES */}
        {step === STEPS.SELECT && (
          <div>
            {/* How Voting Works — shown at top of select step */}
            <HowItWorks />

            {/* Section header + progress */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Choose Your Nominees
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select one nominee per category. You can vote in multiple
                  categories.
                </p>
              </div>
              {totalCategories > 0 && (
                <div className="text-right shrink-0 ml-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedCount}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    /{totalCategories}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    selected
                  </p>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-8 mt-6">
              {categories.map((category) => {
                const isVotedInCategory = !!selectedNominees[category];
                return (
                  <div key={category}>
                    {/* Category header with ✅/❌ indicator */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {category}
                      </h3>
                      {isVotedInCategory ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Selected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Not selected
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {grouped[category].map((n) => (
                        <NomineeCard
                          key={n._id}
                          nominee={n}
                          selected={selectedNominees[category]}
                          onSelect={handleSelectNominee}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {selectedCount === 0
                  ? "Select at least one nominee to continue"
                  : `${selectedCount} categor${selectedCount === 1 ? "y" : "ies"} selected — you can add more or continue`}
              </p>
              <button
                onClick={handleProceedToEmail}
                disabled={selectedCount === 0}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* EMAIL INPUT */}
        {step === STEPS.EMAIL && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Enter Your Email
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                We'll send a verification OTP to your Gmail.
              </p>

              {/* Summary of selections */}
              <div className="mb-5 mt-3 space-y-1.5">
                {Object.entries(selectedNominees).map(([cat, nomineeId]) => {
                  const nominee = nominees.find((n) => n._id === nomineeId);
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">✓</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{cat}:</span>
                      <span>{nominee?.name || "—"}</span>
                    </div>
                  );
                })}
              </div>

              <EmailInput
                email={email}
                setEmail={setEmail}
                error={fieldError}
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRequestOtp}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP INPUT */}
        {step === STEPS.OTP && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Verify OTP
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {email}
                </span>
              </p>

              <OtpInput otp={otp} setOtp={setOtp} error={fieldError} />

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || submitting}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyAndVote}
                  disabled={submitting || otp.length !== 6}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Verifying..." : "Verify & Vote"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-white/40 dark:border-gray-700/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
          Flutter Chennai Community &middot; Secure OTP-based voting &middot; One vote per category
        </div>
      </footer>
    </AnimatedBackgroundLayout>
  );
}
