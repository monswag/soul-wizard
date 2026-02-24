import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { StepReveal } from '../StepReveal'
import { ARCHETYPES } from '../../../core/archetypes'
import type { StyleChoices } from '../../../core/types'

const DEFAULT_CHOICES: StyleChoices = {
  communication: 'advisor',
  feedback: 'direct',
  output: 'overview',
  boundary: 'private',
}

function renderReveal(overrides?: Partial<StyleChoices>) {
  const choices = { ...DEFAULT_CHOICES, ...overrides }
  const setChoices = vi.fn()
  const onNext = vi.fn()
  const onPrev = vi.fn()

  render(
    <StepReveal
      archetypeKey="先知"
      choices={choices}
      setChoices={setChoices}
      onNext={onNext}
      onPrev={onPrev}
    />
  )

  return { setChoices, onNext, onPrev }
}

/** Simulate a pointer drag on a .tune-slider-custom element at a given ratio (0-1). */
function dragSlider(el: Element, ratio: number) {
  const width = 300
  ;(el as HTMLElement).setPointerCapture = vi.fn()
  vi.spyOn(el as HTMLElement, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: width, top: 0, bottom: 44,
    width, height: 44, x: 0, y: 0, toJSON: () => ({}),
  } as DOMRect)
  fireEvent.pointerDown(el, { clientX: ratio * width, pointerId: 1 })
}

describe('StepReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('renders card area on mount', () => {
    renderReveal()
    expect(screen.getByText('先知')).toBeInTheDocument()
  })

  test('sliders are NOT visible before 3200ms', () => {
    renderReveal()
    expect(document.querySelectorAll('.tune-slider-custom')).toHaveLength(0)
  })

  test('sliders appear after 3200ms', () => {
    renderReveal()
    act(() => { vi.advanceTimersByTime(3200) })
    expect(document.querySelectorAll('.tune-slider-custom')).toHaveLength(3)
  })

  test('dragging communication slider to max calls setChoices with partner', () => {
    const { setChoices } = renderReveal()
    act(() => { vi.advanceTimersByTime(3200) })

    const sliders = document.querySelectorAll('.tune-slider-custom')
    expect(sliders.length).toBeGreaterThan(0)

    // ratio=1 → value=1 → communication='partner'
    dragSlider(sliders[0], 1)
    expect(setChoices).toHaveBeenCalledWith(
      expect.objectContaining({ communication: 'partner' })
    )
  })

  test('dragging feedback slider to max calls setChoices with gentle', () => {
    const { setChoices } = renderReveal()
    act(() => { vi.advanceTimersByTime(3200) })

    const sliders = document.querySelectorAll('.tune-slider-custom')
    // ratio=1 → value=1 → feedback='gentle'
    dragSlider(sliders[1], 1)
    expect(setChoices).toHaveBeenCalledWith(
      expect.objectContaining({ feedback: 'gentle' })
    )
  })

  test('onNext fires when "继续" button is clicked', () => {
    const { onNext } = renderReveal()
    act(() => { vi.advanceTimersByTime(3200) })

    fireEvent.click(screen.getByText(/继续/))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  test('onPrev fires when "重新来过" is clicked', () => {
    const { onPrev } = renderReveal()
    act(() => { vi.advanceTimersByTime(3200) })

    fireEvent.click(screen.getByText(/重新来过/))
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  test('all 4 archetypes render without error', () => {
    const archetypes = ['先知', '向导', '执刃', '精灵'] as const
    for (const key of archetypes) {
      const choices = ARCHETYPES[key].defaultChoices
      const { unmount } = render(
        <StepReveal
          archetypeKey={key}
          choices={choices}
          setChoices={vi.fn()}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      )
      expect(screen.getByText(key)).toBeInTheDocument()
      unmount()
    }
  })
})
