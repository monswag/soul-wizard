import { useEffect, useRef } from 'react'
import { SoulOrb } from '../core/SoulOrb'
import type { OrbParams } from '../core/types'

interface Props {
  params: OrbParams
}

export function OrbCanvas({ params }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbRef    = useRef<SoulOrb | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // Size the canvas to full viewport before handing to Three.js
    canvasRef.current.width  = window.innerWidth
    canvasRef.current.height = window.innerHeight
    const orb = new SoulOrb(canvasRef.current, params)
    orb.start()
    orbRef.current = orb
    return () => orb.dispose()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    orbRef.current?.setParams(params)
  }, [params])

  return (
    <div className="orb-bg">
      <canvas ref={canvasRef} />
    </div>
  )
}
