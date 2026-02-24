import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom doesn't implement canvas — mock the 2D context used by Confetti
const mockCtx = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  globalAlpha: 1,
  fillStyle: '',
}

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx)
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 300, height: 400, top: 0, left: 0, right: 300, bottom: 400,
  x: 0, y: 0, toJSON: () => ({}),
})

// Mock requestAnimationFrame for canvas loops (jsdom environment uses window)
window.requestAnimationFrame = vi.fn(cb => { cb(0); return 0 }) as unknown as typeof requestAnimationFrame
window.cancelAnimationFrame = vi.fn()
