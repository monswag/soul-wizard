/**
 * Step 0 — Awaken splash
 * Sparse star-dust orb, minimal UI, single CTA.
 */
interface Props {
  onNext: () => void
}

export function StepWelcome({ onNext }: Props) {
  return (
    <>
      <h1 className="step-title" style={{ fontSize: '26px', marginTop: 8 }}>
        唤醒一个<br />新伙伴
      </h1>
      <p className="step-subtitle">
        你将塑造它的性格、声音与边界。<br />这只需要几分钟。
      </p>
      <div className="nav-row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: '13px 22px' }} onClick={onNext}>
          开始唤醒
        </button>
      </div>
    </>
  )
}
