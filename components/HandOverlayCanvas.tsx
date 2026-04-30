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

/** ----------------------------
 *  Finger capsule configuration
 *  ---------------------------- */
const FINGER_GROUPS = [
  { color: [170, 196, 255], segs: [[0,1],[1,2],[2,3],[3,4]] },            // thumb
  { color: [255, 179, 222], segs: [[0,5],[5,6],[6,7],[7,8]] },            // index
  { color: [179, 255, 204], segs: [[5,9],[9,10],[10,11],[11,12]] },       // middle
  { color: [255, 212, 163], segs: [[9,13],[13,14],[14,15],[15,16]] },     // ring
  { color: [255, 224, 102], segs: [[13,17],[17,18],[18,19],[19,20]] },    // pinky
]

export default function HandOverlayCanvas({
  videoRef,
  landmarks,
  ghostLandmarks,
  progress = 0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const landmarksRef = useRef(landmarks)
  const ghostRef = useRef(ghostLandmarks)
  const progressRef = useRef(progress)

  landmarksRef.current = landmarks
  ghostRef.current = ghostLandmarks
  progressRef.current = progress

  function toCanvasCoords(lm: Landmark, canvas: HTMLCanvasElement) {
    return {
      x: (1 - lm.x) * canvas.width,
      y: lm.y * canvas.height,
    }
  }

  /** ----------------------------
   * Capsule drawing primitive
   * ---------------------------- */
  function drawCapsule(
    ctx: CanvasRenderingContext2D,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    radius: number
  ) {
    const dx = bx - ax
    const dy = by - ay
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) return

    const nx = -dy / len
    const ny = dx / len

    ctx.beginPath()
    ctx.moveTo(ax + nx * radius, ay + ny * radius)
    ctx.lineTo(bx + nx * radius, by + ny * radius)
    ctx.arc(bx, by, radius, Math.atan2(ny, nx), Math.atan2(-ny, -nx))
    ctx.lineTo(ax - nx * radius, ay - ny * radius)
    ctx.arc(ax, ay, radius, Math.atan2(-ny, -nx), Math.atan2(ny, nx))
    ctx.closePath()
  }

  /** ----------------------------
   * Active skeleton (colored bones)
   * ---------------------------- */
  function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    lms: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    const p = Math.min(progressRef.current, 1)

    const r = Math.floor(255 * (1 - p))
    const g = Math.floor(255 * p)

    ctx.lineWidth = 4
    ctx.strokeStyle = `rgba(${r},${g},120,0.9)`
    ctx.fillStyle = `rgba(${r},${g},120,1)`

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

  /** ----------------------------
   * Ghost skeleton (CAPSULE BONES)
   * ---------------------------- */
  function drawGhostSkeleton(
    ctx: CanvasRenderingContext2D,
    lms: Landmark[],
    canvas: HTMLCanvasElement
  ) {
    const wrist = toCanvasCoords(lms[0], canvas)
    const midMCP = toCanvasCoords(lms[9], canvas)

    const handSize = Math.sqrt(
      (midMCP.x - wrist.x) ** 2 + (midMCP.y - wrist.y) ** 2
    )

    const baseRadius = handSize * 0.07

    FINGER_GROUPS.forEach(({ color: [r, g, b], segs }) => {
      segs.forEach(([aIdx, bIdx], segIndex) => {
        const a = toCanvasCoords(lms[aIdx], canvas)
        const b = toCanvasCoords(lms[bIdx], canvas)

        const radius = baseRadius * (1 - segIndex * 0.15)

        drawCapsule(ctx, a.x, a.y, b.x, b.y, radius)

        ctx.fillStyle = `rgba(${r},${g},${b},0.12)`
        ctx.strokeStyle = `rgba(${r},${g},${b},0.65)`
        ctx.lineWidth = 1.5

        ctx.fill()
        ctx.stroke()
      })
    })

    // joints
    lms.forEach((lm) => {
      const { x, y } = toCanvasCoords(lm, canvas)
      ctx.beginPath()
      ctx.arc(x, y, baseRadius * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255,255,255,0.12)"
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.5)"
      ctx.stroke()
    })
  }

  useEffect(() => {
    let animId: number

    function render() {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video || !video.videoWidth) {
        animId = requestAnimationFrame(render)
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        animId = requestAnimationFrame(render)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ghost = ghostRef.current
      const lms = landmarksRef.current

      if (ghost) drawGhostSkeleton(ctx, ghost, canvas)
      if (lms) drawSkeleton(ctx, lms, canvas)

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => cancelAnimationFrame(animId)
  }, [videoRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}