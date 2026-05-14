// src/pages/MalMoji/MalMoji.jsx
import { useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import Modal from '../../components/Modal/Modal'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'

// 나중에 API로 교체할 데이터
const MOCK_QUIZ = {
  hint: '힌트 예시 텍스트',
  answer: '정답 예시 텍스트',
  maxAttempts: 5,
}

export default function MalMoji() {
  const [showHint, setShowHint] = useState(false)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState(null)
  const [locked, setLocked] = useState(false)
  const [showGiveUpModal, setShowGiveUpModal] = useState(false)
  const [showHintBtn, setShowHintBtn] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const timerRef = useRef(null)

  const handleSubmit = () => {
    if (status === 'fail') return
    if (input.trim().toLowerCase() === MOCK_QUIZ.answer.trim().toLowerCase()) {
      setStatus('correct')
      setLocked(true)
      setShowHint(true)
      confetti({ particleCount: 80, spread: 160, origin: { x: 0, y: 0.5 }, colors: ['#1DED83'] })
      confetti({ particleCount: 80, spread: 160, origin: { x: 1, y: 0.5 }, colors: ['#1DED83'] })
      confetti({ particleCount: 80, spread: 160, origin: { x: 0.5, y: 0.3 }, colors: ['#1DED83'] })
      setTimeout(() => setShowResultModal(true), 1000)
    } else {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 1) setShowHintBtn(true)
      const isFail = next >= MOCK_QUIZ.maxAttempts
      if (isFail) { setLocked(true); setShowHint(true) }
      setStatus(isFail ? 'fail' : 'wrong')
    }
    setInput('')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3000)
  }

  const handleGiveUp = () => {
    setShowGiveUpModal(true)
  }

  const confirmGiveUp = () => {
    setLocked(true)
    setShowHint(true)
    setShowGiveUpModal(false)
    setStatus('giveup')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3000)
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
      `}</style>

      {/* 배경 영상 */}
      <video autoPlay loop muted style={s.bgVideo}>
        <source src="/src/assets/Neon-grid-crop.mp4" type="video/mp4" />
      </video>

      {/* 토스트 */}
      {status === 'correct' && <Toast message="성공했습니다!" success />}
      {status === 'wrong'   && <Toast message="오답입니다!" />}
      {status === 'fail'   && <Toast message="실패했습니다..." />}
      {status === 'giveup' && <Toast message="포기했습니다..." />}

      {/* 포기 확인 모달 */}  
      <Modal
        isOpen={showGiveUpModal}
        onClose={() => setShowGiveUpModal(false)}
        message="정말 포기하시겠습니까?"
        confirmText="포기"
        onConfirm={confirmGiveUp}
        cancelText="취소"
        onCancel={() => setShowGiveUpModal(false)}
        borderColor="#ff4444"
      />

      {/* 정답 모달 */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        message={`정답입니다! 🎉\n시도 횟수 : ${attempts + 1}/${MOCK_QUIZ.maxAttempts}`}
        confirmText="확인"
        onConfirm={() => setShowResultModal(false)}
      />

      {/* 중앙 콘텐츠 */}
      <div style={s.content}>
        <div style={s.videoBox}>
          <button style={s.playBtn}>
            <img src="/src/assets/sound_noborder.png" style={{ width: 48, height: 48 }} />
          </button>
        </div>

        <div style={s.inputArea}>
          <label style={s.label}>HINT :</label>
            <div style={s.inputWrapper}>
              <input
                style={{ ...s.input, color: showHintBtn ? NEON_TEXT : `${NEON_TEXT}66`, pointerEvents: showHintBtn ? 'auto' : 'none' }}
                type={showHintBtn ? (showHint ? 'text' : 'password') : 'text'}
                value={showHintBtn ? MOCK_QUIZ.hint : '1회 오답 후 힌트가 공개됩니다.'}
                readOnly
              />
              <button style={s.eyeBtn} onClick={() => setShowHint(v => !v)} disabled={!showHintBtn || locked}>
                <img src={showHint ? '/src/assets/view_hide.png' : '/src/assets/view.png'} style={{ width: 24, height: 24, opacity: showHintBtn ? 1 : 0.3 }} />
              </button>
            </div>

          <label style={s.label}>ANSWER :</label>
          <div style={s.row}>
            <input
              style={s.input}
              value={locked ? `정답: ${MOCK_QUIZ.answer}` : input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              readOnly={locked}
            />
            <button style={s.submitBtn} onClick={handleSubmit} disabled={locked}>제출</button>
          </div>
        </div>
      </div>

      {/* 포기하기 / 시도 횟수 */}
      <div style={s.footer}>
        <button style={s.giveUpBtn} onClick={handleGiveUp} disabled={locked}>포기하기</button>
        <span style={s.attempts}>시도 횟수 : {attempts}/{MOCK_QUIZ.maxAttempts}</span>
      </div>

    </div>
  )
}

function Toast({ message, success }) {
  return (
    <div style={s.toast}>
      <img
        src={success ? '/src/assets/Check_fill.png' : '/src/assets/Dell_fill.png'}
        style={{ width: 80, height: 80 }}
      />
      <span style={s.toastText}>{message}</span>
    </div>
  )
}

const s = {
  wrap:         { display: 'flex', flexDirection: 'column', height: '100vh', background: '#060e0b', fontFamily: FONT, color: NEON, position: 'relative', overflow: 'hidden' },
  bgVideo:      { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.7 },
  content:      { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', flex: 1, width: '65%', margin: '0 auto' },
  videoBox:     { background: '#000', border: `4px solid ${NEON}`, borderRadius: 12, margin: '24px 0', width: '100%', height: 300, position: 'relative' },
  inputArea:    { width: '95%', paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 10, margin: '0 auto' },
  label:        { fontSize: 30, color: NEON_TEXT, fontFamily: FONT, marginTop: 16 },
  row:          { display: 'flex', gap: 48, alignItems: 'center' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  input:        { width: '100%', background: '#0E0E17', border: `1px solid ${NEON}`, borderRadius: 2, color: NEON_TEXT, padding: '16px 50px 16px 16px', fontFamily: FONT, fontSize: 22, outline: 'none', boxSizing: 'border-box', boxShadow: `8px 8px 0px ${NEON}` },
  eyeBtn:       { position: 'absolute', right: 24, background: 'transparent', border: 'none', cursor: 'pointer', color: NEON, fontSize: 20 },
  submitBtn:    { padding: '16px 36px', background: '#0E0E17', border: `1px solid ${NEON}`, borderRadius: 2, color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: `8px 8px 0px ${NEON}`, fontSize: 22 },
  footer:       { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', padding: '16px 40px 24px' },
  giveUpBtn:    { background: 'transparent', border: 'none', color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', fontSize: 28 },
  attempts:     { fontSize: 28, color: NEON_TEXT },
  toast: { position: 'absolute', top: 47, left: '50%', transform: 'translateX(-50%)', background: '#3A3A4A', borderRadius: 24, width: 520, height: 160, display: 'flex', gap: 24, alignItems: 'center', paddingLeft: 40, zIndex: 100 },
  toastText: { color: NEON_TEXT, fontFamily: FONT, fontSize: 30 },
  playBtn:      { position: 'absolute', top: 16, left: 16, background: 'transparent', border: 'none', color: NEON, fontSize: 32, cursor: 'pointer' },
  soundBtn:     { position: 'absolute', top: 10, right: 12, background: 'transparent', border: 'none', color: NEON, fontSize: 20, cursor: 'pointer' },
}