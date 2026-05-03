"use client"

type Props = {
  progress: number // 0 to 1
}

export default function ProgressFace({ progress }: Props) {
  const p = Math.min(Math.max(progress, 0), 1)

  // Mouth curve: flat at 0, big smile at 1
  const mouthLift = p * 12
  const mouthD = `M 32 58 Q 50 ${58 + mouthLift} 68 58`

  // Eyes: open at 0, happy squint at 1
  const eyeSquint = p * 5

  // Color: red → green with progress
  const r = Math.floor(255 * (1 - p))
  const g = Math.floor(200 * p + 55)
  const color = `rgb(${r},${g},80)`

  // Eyebrows: flat at 0, raised+angled at 1
  const browLift = p * 6

  return (
    <div className="absolute bottom-3 right-3 pointer-events-none">
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Face circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="rgba(0,0,0,0.45)"
          stroke={color}
          strokeWidth="3"
        />

        {/* Left eyebrow */}
        <path
          d={`M 28 ${36 - browLift} Q 36 ${32 - browLift} 40 ${35 - browLift}`}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Right eyebrow */}
        <path
          d={`M 60 ${35 - browLift} Q 64 ${32 - browLift} 72 ${36 - browLift}`}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Left eye */}
        <ellipse
          cx="34"
          cy="47"
          rx="5"
          ry={Math.max(5 - eyeSquint, 1.5)}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />

        {/* Right eye */}
        <ellipse
          cx="66"
          cy="47"
          rx="5"
          ry={Math.max(5 - eyeSquint, 1.5)}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />

        {/* Mouth */}
        <path
          d={mouthD}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cheeks (only appear with progress) */}
        {p > 0.4 && (
          <>
            <circle cx="26" cy="58" r="7" fill={`rgba(${r},${g},80,0.2)`} />
            <circle cx="74" cy="58" r="7" fill={`rgba(${r},${g},80,0.2)`} />
          </>
        )}
      </svg>
    </div>
  )
}