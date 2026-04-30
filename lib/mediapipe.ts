let handsInstance: any = null

function loadScript(src: string) {
  return new Promise<void>((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
}

export async function createHands(onResults: (res:any)=>void) {
  // Load MediaPipe scripts only once
  if (!window.hasOwnProperty("Hands")) {
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js")
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
  }

  // @ts-ignore - global injected by script
  const Hands = (window as any).Hands

  handsInstance = new Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  handsInstance.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
  })

  handsInstance.onResults(onResults)

  return handsInstance
}