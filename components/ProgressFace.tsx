"use client"

type Props = {
  progress: number
}

function getMessage(p: number): string {
  if (p === 0)   return "Show me your hand!"
  if (p < 0.25)  return "Good start, keep going!"
  if (p < 0.5)   return "You're warming up! 🔥"
  if (p < 0.75)  return "Halfway there, push it!"
  if (p < 0.9)   return "Almost there! Don't stop!"
  if (p < 1.0)   return "So close!! Give it all!"
  return "Perfect stretch! 🎉"
}

export default function ProgressFace({ progress }: Props) {
  const p = Math.min(Math.max(progress, 0), 1)

  const mouthLift = p * 12
  const mouthD = `M 32 58 Q 50 ${58 + mouthLift} 68 58`
  const eyeSquint = p * 5
  const r = Math.floor(255 * (1 - p))
  const g = Math.floor(200 * p + 55)
  const color = `rgb(${r},${g},80)`
  const browLift = p * 6
  const message = getMessage(p)

  return (
    <div className="absolute bottom-3 right-3 pointer-events-none flex flex-col items-end gap-1">

      {/* Speech bubble */}
      <div
        className="relative max-w-[160px] px-3 py-2 rounded-2xl text-xs font-semibold text-white text-right"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: `1.5px solid ${color}`,
          color,
          transition: "all 0.4s ease",
        }}
      >
        {message}
        {/* Bubble tail pointing down-right toward face */}
        <div
          style={{
            position: "absolute",
            bottom: -8,
            right: 28,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${color}`,
          }}
        />
      </div>

      {/* Face */}
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.45)" stroke={color} strokeWidth="3"/>
        <path d={`M 28 ${36 - browLift} Q 36 ${32 - browLift} 40 ${35 - browLift}`} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <path d={`M 60 ${35 - browLift} Q 64 ${32 - browLift} 72 ${36 - browLift}`} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="34" cy="47" rx="5" ry={Math.max(5 - eyeSquint, 1.5)} stroke={color} strokeWidth="2" fill="none"/>
        <ellipse cx="66" cy="47" rx="5" ry={Math.max(5 - eyeSquint, 1.5)} stroke={color} strokeWidth="2" fill="none"/>
        <path d={mouthD} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        {p > 0.4 && (
          <>
            <circle cx="26" cy="58" r="7" fill={`rgba(${r},${g},80,0.2)`}/>
            <circle cx="74" cy="58" r="7" fill={`rgba(${r},${g},80,0.2)`}/>
          </>
        )}
      </svg>
    </div>
  )
}