import { useState, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import Modal from '../../components/Modal/Modal'
import api from '../../api/index'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'
import soundNoborderIcon from '../../assets/sound_noborder.png'
import viewIcon from '../../assets/View.png'
import viewHideIcon from '../../assets/View_hide.png'
import checkFillIcon from '../../assets/Check_fill.png'
import dellFillIcon from '../../assets/Dell_fill.png'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'

export default function MalMoji() {
  const [quiz, setQuiz] = useState(null)
  const [hint, setHint] = useState(null)
  const [revealedAnswer, setRevealedAnswer] = useState(null)
  const [score, setScore] = useState(null)

  const [showHint, setShowHint] = useState(false)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState(null)
  const [locked, setLocked] = useState(false)
  const [showGiveUpModal, setShowGiveUpModal] = useState(false)
  const [showHintBtn, setShowHintBtn] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)

  const [playingIdx, setPlayingIdx] = useState(null)
  const [isSequencePlaying, setIsSequencePlaying] = useState(false)

  const timerRef = useRef(null)
  const playTimerRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get('/api/v1/neoliz/quiz/daily')
        const q = data.data
        setQuiz(q)

        const used = q.maxAttempts - q.remainingAttempts
        setAttempts(used)
        if (used >= 1) {
          setShowHintBtn(true)
          fetchHint()
        }

        if (q.isFinished) {
          setLocked(true)
          setShowHintBtn(true)
          setShowHint(true)
          if (q.answer) setRevealedAnswer(q.answer)
          if (q.isSolved) setScore(q.score)
        }
      } catch (err) {
        console.error('퀴즈 불러오기 실패', err)
      }
    }
    fetchQuiz()
  }, [])

  const fetchHint = async () => {
    try {
      const { data } = await api.post('/api/v1/neoliz/quiz/daily/hint')
      setHint(data.data.category)
    } catch (err) {
      console.error('힌트 불러오기 실패', err)
    }
  }

  const handlePlaySequence = () => {
    if (!quiz?.sequence?.length || isSequencePlaying) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    clearTimeout(playTimerRef.current)
    setIsSequencePlaying(true)
    let step = 0
    const next = () => {
      if (step >= quiz.sequence.length) {
        setPlayingIdx(null)
        setIsSequencePlaying(false)
        return
      }
      setPlayingIdx(step)
      const item = quiz.sequence[step]
      if (item.soundUrl) {
        const audio = new Audio(item.soundUrl)
        audioRef.current = audio
        audio.play().catch(() => {})
      }
      playTimerRef.current = setTimeout(() => { step++; next() }, 1000)
    }
    next()
  }

  const handleSubmit = async () => {
    if (locked || !quiz || !input.trim()) return
    try {
      const { data } = await api.post('/api/v1/neoliz/quiz/daily/submit', {
        answer: input.trim(),
      })
      const result = data.data

      if (result.isCorrect) {
        setAttempts(result.attemptCount)
        setScore(result.score)
        setStatus('correct')
        setLocked(true)
        setShowHint(true)
        confetti({ particleCount: 80, spread: 160, origin: { x: 0, y: 0.5 }, colors: ['#1DED83'] })
        confetti({ particleCount: 80, spread: 160, origin: { x: 1, y: 0.5 }, colors: ['#1DED83'] })
        confetti({ particleCount: 80, spread: 160, origin: { x: 0.5, y: 0.3 }, colors: ['#1DED83'] })
        setTimeout(() => setShowResultModal(true), 1000)
      } else {
        const used = quiz.maxAttempts - result.remainingAttempts
        setAttempts(used)
        setShowHintBtn(true)
        if (used === 1 && !hint) fetchHint()
        if (result.isFinished) {
          setLocked(true)
          setShowHint(true)
          setRevealedAnswer(result.answer)
          setStatus('fail')
        } else {
          setStatus('wrong')
        }
      }
    } catch (err) {
      console.error('정답 제출 실패', err)
    }
    setInput('')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3000)
  }

  const handleGiveUp = () => setShowGiveUpModal(true)

  const confirmGiveUp = async () => {
    try {
      const { data } = await api.post('/api/v1/neoliz/quiz/daily/submit', {
        isGivenUp: true,
      })
      if (data.data?.answer) setRevealedAnswer(data.data.answer)
    } catch (err) {
      console.error('포기 처리 실패', err)
    }
    setLocked(true)
    setShowHint(true)
    setShowGiveUpModal(false)
    setStatus('giveup')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3000)
  }

  const maxAttempts = quiz?.maxAttempts ?? 5
  const hintDisplay = hint ?? (showHintBtn ? '' : '1회 오답 후 힌트가 공개됩니다.')
  const answerDisplay = revealedAnswer ? `정답: ${revealedAnswer}` : input

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
      `}</style>

      <video autoPlay loop muted style={s.bgVideo}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>

      {status === 'correct' && <Toast message="성공했습니다!" success />}
      {status === 'wrong'   && <Toast message="오답입니다!" />}
      {status === 'fail'    && <Toast message="실패했습니다..." />}
      {status === 'giveup'  && <Toast message="포기했습니다..." />}

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

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        message={`정답입니다! 🎉\n시도 횟수 : ${attempts}/${maxAttempts}${score != null ? `\n점수 : ${score}점` : ''}`}
        confirmText="확인"
        onConfirm={() => setShowResultModal(false)}
      />

      <div style={s.content}>
        {/* 이모지 시퀀스 */}
        <div style={s.videoBox}>
          <div style={s.emojiRow}>
            {quiz?.sequence.map((item, i) => (
              <img
                key={item.emojiId}
                src={item.imageUrl}
                alt=""
                style={{
                  ...s.emojiImg,
                  opacity: isSequencePlaying ? (playingIdx === i ? 1 : 0.3) : 1,
                  transform: playingIdx === i ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
          <button style={s.playBtn} onClick={handlePlaySequence} disabled={isSequencePlaying}>
            <img src={soundNoborderIcon} style={{ width: 48, height: 48 }} />
          </button>
        </div>

        <div style={s.inputArea}>
          <label style={s.label}>HINT :</label>
          <div style={s.inputWrapper}>
            <input
              style={{ ...s.input, color: showHintBtn ? NEON_TEXT : `${NEON_TEXT}66`, pointerEvents: 'none' }}
              type={showHintBtn ? (showHint ? 'text' : 'password') : 'text'}
              value={hintDisplay}
              readOnly
            />
            <button style={s.eyeBtn} onClick={() => setShowHint(v => !v)} disabled={!showHintBtn || locked}>
              <img src={showHint ? viewHideIcon : viewIcon} style={{ width: 24, height: 24, opacity: showHintBtn ? 1 : 0.3 }} />
            </button>
          </div>

          <label style={s.label}>ANSWER :</label>
          <div style={s.row}>
            <input
              style={s.input}
              value={locked ? answerDisplay : input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              readOnly={locked}
            />
            <button style={s.submitBtn} onClick={handleSubmit} disabled={locked}>제출</button>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        <button style={s.giveUpBtn} onClick={handleGiveUp} disabled={locked}>포기하기</button>
        <span style={s.attempts}>시도 횟수 : {attempts}/{maxAttempts}</span>
      </div>
    </div>
  )
}

function Toast({ message, success }) {
  return (
    <div style={s.toast}>
      <img src={success ? checkFillIcon : dellFillIcon} style={{ width: 80, height: 80 }} />
      <span style={s.toastText}>{message}</span>
    </div>
  )
}

const s = {
  wrap:         { display: 'flex', flexDirection: 'column', height: '100vh', background: '#060e0b', fontFamily: FONT, color: NEON, position: 'relative', overflow: 'hidden' },
  bgVideo:      { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.7 },
  content:      { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', flex: 1, width: '65%', margin: '0 auto' },
  videoBox:     { background: '#000', border: `4px solid ${NEON}`, borderRadius: 12, margin: '24px 0', width: '100%', height: 300, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emojiRow:     { display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' },
  emojiImg:     { width: 96, height: 96, objectFit: 'contain' },
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
  toast:        { position: 'absolute', top: 47, left: '50%', transform: 'translateX(-50%)', background: '#3A3A4A', borderRadius: 24, width: 520, height: 160, display: 'flex', gap: 24, alignItems: 'center', paddingLeft: 40, zIndex: 100 },
  toastText:    { color: NEON_TEXT, fontFamily: FONT, fontSize: 30 },
  playBtn:      { position: 'absolute', top: 16, left: 16, background: 'transparent', border: 'none', color: NEON, fontSize: 32, cursor: 'pointer' },
}