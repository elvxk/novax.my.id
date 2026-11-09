export default function Logo({
  size = 32,
  className = "",
  iconClassName = "",
  withText = false,
  textClassName = "",
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className={`rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${iconClassName}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Base Stamp */}
          <rect width="100" height="100" rx="22" fill="#10380b" />

          {/* Diagonal Network Coordinates */}
          <line
            x1="26"
            y1="26"
            x2="74"
            y2="74"
            stroke="#30be60"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <line
            x1="74"
            y1="26"
            x2="26"
            y2="74"
            stroke="#30be60"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          {/* 4-point Diamond Starburst (Nova) */}
          <path
            d="M50 18 C50 36 36 50 18 50 C36 50 50 64 50 82 C50 64 64 50 82 50 C64 50 50 36 50 18 Z"
            fill="#fce519"
          />

          {/* Core Focus Eye */}
          <circle cx="50" cy="50" r="5" fill="#10380b" />
          <circle cx="50" cy="50" r="2" fill="#ffffff" />
        </svg>
      </div>

      {withText && (
        <span
          className={`text-ink font-extrabold text-base tracking-tight ${textClassName}`}
        >
          Nova-X
        </span>
      )}
    </div>
  );
}
