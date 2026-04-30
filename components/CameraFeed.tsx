"use client"
import { useEffect, useRef, useState } from "react"
import { createHands } from "@/lib/mediapipe"
import HandOverlayCanvas from "./HandOverlayCanvas"
import { Landmark } from "@/types/hand"
import {
  getStretchRatio,
  normalizePose,
  generateTargetPose
} from "@/lib/handMath"

export default function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null)
  const [baselineRatio, setBaselineRatio] = useState<number | null>(null)
  const [normalizedPose, setNormalizedPose] = useState<Landmark[] | null>(null)
  const [targetPose, setTargetPose] = useState<Landmark[] | null>(null)

  useEffect(() => {
    if (!videoRef.current) return
    let animationId: number
    let hands: any

    async function initCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current!.srcObject = stream
      await videoRef.current!.play()

      hands = await createHands((results) => {
        if (results.multiHandLandmarks?.length) {
          const lm = results.multiHandLandmarks[0]
          setLandmarks(lm)

          if (baselineRatio && normalizedPose) {
            const targetScale = 1.05 // 5% harder
            const newTarget = generateTargetPose(normalizedPose, lm, targetScale)
            setTargetPose(newTarget)
          }

        } else {
          setLandmarks(null)
        }
      })

      async function detect() {
        await hands.send({ image: videoRef.current! })
        animationId = requestAnimationFrame(detect)
      }

      detect()
    }

    initCamera()
    return () => cancelAnimationFrame(animationId)
  }, [baselineRatio, normalizedPose])

  function calibrate() {
    if (!landmarks) return
    const ratio = getStretchRatio(landmarks)
    setBaselineRatio(ratio)
    setNormalizedPose(normalizePose(landmarks))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[640px]">
        <video ref={videoRef} className="w-full scale-x-[-1] rounded-xl" autoPlay playsInline muted />
        <HandOverlayCanvas
          videoRef={videoRef}
          landmarks={landmarks}
          ghostLandmarks={targetPose}
        />
      </div>

      <button
        onClick={calibrate}
        className="px-6 py-3 bg-green-500 text-black font-bold rounded-xl"
      >
        Calibrate Comfortable Stretch
      </button>
    </div>
  )
}