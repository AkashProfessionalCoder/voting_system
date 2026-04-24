import { useRef, useState } from "react";

export default function OtpInput({ otp, setOtp, error }) {
  const inputRefs = useRef([]);
  const [values, setValues] = useState(otp ? otp.split("") : Array(6).fill(""));

  const handleChange = (index, value) => {
    // Allow only digits
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    setOtp(newValues.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newValues = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setValues(newValues);
    setOtp(newValues.join(""));

    // Focus the next empty or last input
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Enter 6-digit OTP
      </label>
      <div className="flex gap-2 justify-center">
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`
              w-12 h-14 text-center text-xl font-bold rounded-lg border-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
              ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
              ${val ? "border-blue-400 bg-blue-50" : ""}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
