import { useEffect, useState } from 'react'

const NEON = '#1DED83'
const BG = '#060e0b'
const FONT = 'NeoDunggeunmo, monospace'
const BREAKPOINT = 900 // 이 너비 이하 + 세로모드일 때만 오버레이 표시

export default function RotateOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(
      `(orientation: portrait) and (max-width: ${BREAKPOINT}px)`
    )
    const update = () => setShow(mq.matches)
    update()

    mq.addEventListener('change', update)
    // 일부 구형 브라우저 대비 resize도 같이 체크
    window.addEventListener('resize', update)

    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!show) return null

  return (
    <div style={s.overlay}>
      <div style={s.icon}>📱</div>
      <div style={s.text}>기기를 가로로 돌려주세요</div>
      <div style={s.subText}>더 나은 경험을 위해 가로모드를 지원합니다</div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: BG,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontFamily: FONT,
  },
  icon: {
    fontSize: 48,
    animation: 'rotate-hint 1.6s ease-in-out infinite',
  },
  text: {
    color: NEON,
    fontSize: 22,
    letterSpacing: 1,
  },
  subText: {
    color: '#6b7d74',
    fontSize: 14,
  },
}