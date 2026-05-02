import { Landmark } from "@/types/hand"

export function distance3D(a: Landmark, b: Landmark) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  )
}

// wrist → middle fingertip / wrist → middle knuckle
export function getStretchRatio(landmarks: Landmark[]) {
  const wrist = landmarks[0]
  const middleTip = landmarks[12]
  const middleKnuckle = landmarks[9]

  const stretchLength = distance3D(wrist, middleTip)
  const palmLength = distance3D(wrist, middleKnuckle)

  return stretchLength / palmLength
}

// Normalize pose relative to wrist so we can scale it later
export function normalizePose(landmarks: Landmark[]): Landmark[] {
  const wrist = landmarks[0]
  return landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }))
}

// Scale normalized pose by factor and reattach to live wrist
export function generateTargetPose(
  normalizedPose: Landmark[],
  liveLandmarks: Landmark[],
  scale: number
): Landmark[] {
  const wrist = liveLandmarks[0]

  return normalizedPose.map(lm => ({
    x: Math.min(Math.max(wrist.x + lm.x * scale, 0), 1),
    y: Math.min(Math.max(wrist.y + lm.y * scale, 0), 1),
    z: wrist.z + lm.z * scale,
  }))
}

export function getProgress(
  liveLandmarks: Landmark[],
  baselineRatio: number
) {
  const currentRatio = getStretchRatio(liveLandmarks)
  const targetRatio = baselineRatio * 1.05
  return currentRatio / targetRatio
}