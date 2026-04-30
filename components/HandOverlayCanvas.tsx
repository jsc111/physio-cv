"use client"
import { useEffect, useRef } from "react"
import { HAND_CONNECTIONS } from "@/lib/handConnections"
import { Landmark } from "@/types/hand"

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>
  landmarks: Landmark[] | null
  ghostLandmarks?: Landmark[] | null
}

export default function HandOverlayCanvas({
  videoRef,
  landmarks,
  ghostLandmarks
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function toCanvasCoords(lm: Landmark, canvas: HTMLCanvasElement) {
    return {
      x: (1 - lm.x) * canvas.width,
      y: lm.y * canvas.height
    }
  }

  function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    ctx.lineWidth = 4
    ctx.strokeStyle = "rgba(0,255,180,0.7)"
    ctx.fillStyle = "rgba(0,255,180,0.9)"

    HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
      const a = toCanvasCoords(landmarks[aIdx], canvas)
      const b = toCanvasCoords(landmarks[bIdx], canvas)

      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    })

    landmarks.forEach(lm => {
      const { x, y } = toCanvasCoords(lm, canvas)
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  function drawGhostSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgba(255,255,255,0.35)"
    ctx.fillStyle = "rgba(255,255,255,0.25)"

    HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
      const a = toCanvasCoords(landmarks[aIdx], canvas)
      const b = toCanvasCoords(landmarks[bIdx], canvas)

      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    })

    landmarks.forEach(lm => {
      const { x, y } = toCanvasCoords(lm, canvas)
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const video = videoRef.current!
    const ctx = canvas.getContext("2d")!

    function render() {
      if (!video.videoWidth) {
        requestAnimationFrame(render)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw ghost first, then live hand on top
      if (ghostLandmarks) drawGhostSkeleton(ctx, ghostLandmarks, canvas)
      if (landmarks) drawSkeleton(ctx, landmarks, canvas)

      requestAnimationFrame(render)
    }

    render()
  }, [landmarks, ghostLandmarks, videoRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}