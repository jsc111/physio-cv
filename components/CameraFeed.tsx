  "use client"

  import { useEffect, useRef, useState } from "react"
  import { createHands } from "@/lib/mediapipe"
  import HandOverlayCanvas from "./HandOverlayCanvas"
  import ProgressFace from "./ProgressFace"
  import { Landmark } from "@/types/hand"
  import {
    getStretchRatio,
    normalizePose,
    generateTargetPose,
    getProgress
  } from "@/lib/handMath"

  export default function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null)

    const [landmarks, setLandmarks]       = useState<Landmark[] | null>(null)
    const [baselineRatio, setBaselineRatio] = useState<number | null>(null)
    const [normalizedPose, setNormalizedPose] = useState<Landmark[] | null>(null)
    const [targetPose, setTargetPose]     = useState<Landmark[] | null>(null)
    const [progress, setProgress]         = useState(0)

    // 🪨 Refs so mediapipe callback always reads fresh values (no stale closure)
    const baselineRatioRef  = useRef(baselineRatio)
    const normalizedPoseRef = useRef(normalizedPose)
    baselineRatioRef.current  = baselineRatio
    normalizedPoseRef.current = normalizedPose

    useEffect(() => {
      if (!videoRef.current) return

      let animationId: number
      let hands: any

      async function initCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        hands = await createHands((results) => {
          if (results.multiHandLandmarks?.length) {
            const lm = results.multiHandLandmarks[0]
            setLandmarks(lm)

            // 🪨 Read from refs — always fresh inside this callback
            const ratio = baselineRatioRef.current
            const pose  = normalizedPoseRef.current

            if (ratio) {
              const p = getProgress(lm, ratio)
              setProgress(p)
            }

            if (ratio && pose) {
              const newTarget = generateTargetPose(pose, lm, 1.05)
              setTargetPose(newTarget)
            }

          } else {
            setLandmarks(null)
            setTargetPose(null)
          }
        })

        async function detect() {
          if (!videoRef.current) return
          await hands.send({ image: videoRef.current })
          animationId = requestAnimationFrame(detect)
        }

        detect()
      }

      initCamera()

      return () => cancelAnimationFrame(animationId)
    }, []) // 🪨 Empty array — run once. Refs handle fresh values inside

    function calibrate() {
      if (!landmarks) return
      const ratio = getStretchRatio(landmarks)
      setBaselineRatio(ratio)
      setNormalizedPose(normalizePose(landmarks))
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[640px]">
          <video
            ref={videoRef}
            className="w-full scale-x-[-1] rounded-xl"
            autoPlay
            playsInline
            muted
          />

          <HandOverlayCanvas
            videoRef={videoRef}
            landmarks={landmarks}
            ghostLandmarks={targetPose}
            progress={progress}  
          />

          <ProgressFace progress={progress} /> 
        </div>

        <button
          onClick={calibrate}
          className="px-6 py-3 bg-green-500 text-black font-bold rounded-xl"
        >
          Calibrate Comfortable Stretch
        </button>

        <div className="text-white font-semibold">
          Progress: {(progress * 100).toFixed(0)}%
        </div>
      </div>
    )
  }