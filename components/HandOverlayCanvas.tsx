"use client"

import { useEffect, useRef } from "react"
import { HAND_CONNECTIONS } from "@/lib/handConnections"
import { Landmark } from "@/types/hand"

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>
  landmarks: Landmark[] | null
  ghostLandmarks?: Landmark[] | null
  progress?: number
}

export default function HandOverlayCanvas({
  videoRef,
  landmarks,
  ghostLandmarks,
  progress = 0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const landmarksRef = useRef(landmarks)
  const ghostRef     = useRef(ghostLandmarks)
  const progressRef  = useRef(progress)

  landmarksRef.current = landmarks
  ghostRef.current     = ghostLandmarks
  progressRef.current  = progress

  function toCanvasCoords(lm: Landmark, canvas: HTMLCanvasElement) {
    return {
      x: (1 - lm.x) * canvas.width,
      y: lm.y * canvas.height,
    }
  }

  function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    lms: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    const p = Math.min(progressRef.current, 1)

    console.log("🪨 raw progress:", progressRef.current, "| p:", p)

    const r = Math.floor(255 * (1 - p))
    const g = Math.floor(255 * p)

    ctx.lineWidth = 4
    ctx.strokeStyle = `rgba(${r},${g},120,0.9)`
    ctx.fillStyle   = `rgba(${r},${g},120,1)`

    HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
      const a = toCanvasCoords(lms[aIdx], canvas)
      const b = toCanvasCoords(lms[bIdx], canvas)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    })

    lms.forEach((lm) => {
      const { x, y } = toCanvasCoords(lm, canvas)
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function drawGhostSkeleton(
    ctx: CanvasRenderingContext2D,
    lms: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgba(255,255,255,0.35)"
    ctx.fillStyle   = "rgba(255,255,255,0.25)"

    HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
      const a = toCanvasCoords(lms[aIdx], canvas)
      const b = toCanvasCoords(lms[bIdx], canvas)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    })

    lms.forEach((lm) => {
      const { x, y } = toCanvasCoords(lm, canvas)
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  useEffect(() => {
    let animId: number

    function render() {
      // 🪨 GUARD — wait for DOM. Canvas or video not ready? Try again next frame
      const canvas = canvasRef.current
      const video  = videoRef.current

      if (!canvas || !video || !video.videoWidth) {
        animId = requestAnimationFrame(render)
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        animId = requestAnimationFrame(render)
        return
      }

      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ghost = ghostRef.current
      const lms   = landmarksRef.current

      if (ghost) drawGhostSkeleton(ctx, ghost, canvas)
      if (lms)   drawSkeleton(ctx, lms, canvas)

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => cancelAnimationFrame(animId)
  }, [videoRef]) // only restart if video element itself swapped

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}