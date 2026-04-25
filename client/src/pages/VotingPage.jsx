import { useState, useEffect } from "react";
import NomineeCard from "../components/NomineeCard";
import EmailInput from "../components/EmailInput";
import OtpInput from "../components/OtpInput";
import SuccessScreen from "../components/SuccessScreen";
import Loader from "../components/Loader";
import AnimatedBackgroundLayout from "../components/AnimatedBackgroundLayout";
import {
  getNominees,
  getDeadline,
  requestOtp,
  verifyOtp,
  castVote,
} from "../services/api";

const STEPS = {
  SELECT: "select",
  EMAIL: "email",
  OTP: "otp",
  SUBMITTING: "submitting",
  SUCCESS: "success",
};

export default function VotingPage() {
  const [nominees, setNominees] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.SELECT);

  // Form state
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");

  // Error / loading states
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Fetch nominees + deadline
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

  // Group nominees by category
  const grouped = nominees.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = [];
    acc[n.category].push(n);
    return acc;
  }, {});

  const handleSelectNominee = (id) => {
    setSelectedNominee(id);
    setError("");
  };

  const handleProceedToEmail = () => {
    if (!selectedNominee) {
      setError("Please select a nominee.");
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
    if (!/^[a-zA-Z0-9.]+@gmail\.com$/.test(trimmed)) {
      setFieldError("Only @gmail.com addresses are allowed.");
      return;
    }

    setSubmitting(true);
    try {
      await requestOtp(trimmed);
      setOtpSent(true);
      setCountdown(60);
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
    try {
      // Step 1: Verify OTP
      const verifyRes = await verifyOtp(email.trim().toLowerCase(), otp);
      const voteToken = verifyRes.data.token;
      setToken(voteToken);

      // Step 2: Cast vote
      setStep(STEPS.SUBMITTING);
      await castVote(selectedNominee, voteToken);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed.";
      setError(msg);
      if (step === STEPS.SUBMITTING) setStep(STEPS.OTP);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
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

  if (isDeadlinePassed) {
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
        {step === STEPS.SUCCESS && <SuccessScreen />}

        {/* SUBMITTING */}
        {step === STEPS.SUBMITTING && <Loader text="Recording your vote..." />}

        {/* SELECT NOMINEE */}
        {step === STEPS.SELECT && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Choose Your Nominee
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Select the person you'd like to vote for.
            </p>

            {Object.entries(grouped).map(([category, noms]) => (
              <div key={category} className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {noms.map((n) => (
                    <NomineeCard
                      key={n._id}
                      nominee={n}
                      selected={selectedNominee}
                      onSelect={handleSelectNominee}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProceedToEmail}
                disabled={!selectedNominee}
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We'll send a verification OTP to your Gmail.
              </p>

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
                <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
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
          Flutter Chennai Community &middot; Secure OTP-based voting
        </div>
      </footer>
    </AnimatedBackgroundLayout>
  );
}
