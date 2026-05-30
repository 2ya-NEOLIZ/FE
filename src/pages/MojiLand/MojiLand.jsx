import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal/Modal'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'
import soundIcon from '../../assets/sound.png'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'
const GOLD = '#f5c518'

const SCORE = { PERFECT: 100, GOOD: 50, MISS: 0 }
const COMBO_BONUS = 10

const PHASE = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  GAME: 'game',
  RESULT: 'result',
  RANKING: 'ranking',
}

const HOW_TO_PLAY = `START 버튼을 누르면 바로 라운드가 시작됩니다.
한 라운드에는 10개의 이모지가 등장하며
이모지가 순서대로 하이라이트되면서 소리가 재생됩니다.
이모지가 하이라이트되는 순간 타이밍에 맞춰 정확하게 탭하세요!
탭 정확도에 따라 점수가 달라지며
연속으로 성공하면 콤보 BONUS를 획득할 수 있습니다.
단, Miss하면 콤보는 초기화됩니다.`

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

export default function MojiLand() {
  const navigate = useNavigate()

  const [phase, setPhase] = useState(PHASE.WAITING)
  const [countdown, setCountdown] = useState(3)

  const [gameId, setGameId] = useState(null)
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState(0)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [results, setResults] = useState([])
  const [judgment, setJudgment] = useState(null)

  const barPosRef = useRef(0)
  const barDirRef = useRef(1)
  const markerRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastTimeRef = useRef(null)

  const [finalResult, setFinalResult] = useState(null)

  const [modal, setModal] = useState({ open: false, message: '', onConfirm: null, cancelText: undefined, onCancel: undefined })

  const openModal = (message, onConfirm, cancelText, onCancel) =>
    setModal({ open: true, message, onConfirm, cancelText, onCancel })
  const closeModal = () => setModal(prev => ({ ...prev, open: false }))

  // ── 로그인 체크 ──
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      openModal(
        '로그인 후 플레이할 수 있습니다.',
        () => { closeModal(); navigate('/login') },
        undefined,
        () => { closeModal(); navigate('/') }
      )
    }
  }, [navigate])

  // ── 플레이 가능 여부 조회 ──
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/neoliz/catch/status', {
        headers: getAuthHeader(),
      })
      if (res.status === 401) {
        openModal('로그인 후 플레이할 수 있습니다.', () => { closeModal(); navigate('/login') })
        return false
      }
      const data = await res.json()
      if (!data.data.isPlayable) {
        openModal(
          `오늘 플레이 횟수를 모두 사용했습니다.\n내일 다시 도전하세요! (${data.data.maxPlays}회/일)`,
          closeModal
        )
        return false
      }
      return true
    } catch {
      openModal('네트워크 오류가 발생했습니다.', closeModal)
      return false
    }
  }

  const startGame = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      openModal('로그인 후 플레이할 수 있습니다.', () => { closeModal(); navigate('/login') })
      return
    }

    const canPlay = await fetchStatus()
    if (!canPlay) return

    try {
      const res = await fetch('/api/v1/neoliz/catch/start', {
        method: 'POST',
        headers: getAuthHeader(),
      })
      if (res.status === 403) {
        openModal('오늘 플레이 횟수를 모두 사용했습니다.', closeModal)
        return
      }
      if (!res.ok) {
        openModal('게임 시작에 실패했습니다.', closeModal)
        return
      }
      const data = await res.json()
      setGameId(data.data.gameId)
      setRounds(data.data.rounds)
      startCountdown()
    } catch {
      openModal('게임 시작에 실패했습니다.', closeModal)
    }
  }

  // ── 카운트다운 ──
  const startCountdown = () => {
    setPhase(PHASE.COUNTDOWN)
    setCountdown(3)
  }

  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN) return
    if (countdown === 0) {
      setPhase(PHASE.GAME)
      setCurrentRound(0)
      setScore(0)
      setCombo(0)
      setMaxCombo(0)
      setResults([])
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // ── 바 애니메이션 ──
  const startBar = useCallback((speed) => {
    lastTimeRef.current = null
    const animate = (ts) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts
      const dt = (ts - lastTimeRef.current) / 1000
      lastTimeRef.current = ts

      barPosRef.current += barDirRef.current * speed * dt
      if (barPosRef.current >= 1) { barPosRef.current = 1; barDirRef.current = -1 }
      if (barPosRef.current <= 0) { barPosRef.current = 0; barDirRef.current = 1 }

      if (markerRef.current) {
        markerRef.current.style.left = `calc(${barPosRef.current * 100}% - 28px)`
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
  }, [])

  const stopBar = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
  }, [])

  // ── 라운드 시작 ──
  useEffect(() => {
    if (phase !== PHASE.GAME || !rounds[currentRound]) return

    barPosRef.current = 0
    barDirRef.current = 1
    if (markerRef.current) markerRef.current.style.left = '0px'
    setJudgment(null)

    // 라운드 시작 시 사운드 재생
    if (rounds[currentRound].soundUrl) {
      const audio = new Audio(rounds[currentRound].soundUrl)
      audio.play().catch(() => {})
    }

    startBar(rounds[currentRound].barSpeed || 1.0)
    return () => stopBar()
  }, [phase, currentRound, rounds, startBar, stopBar])

  // ── TAP 처리 ──
  const handleTap = useCallback(() => {
    if (phase !== PHASE.GAME) return
    const round = rounds[currentRound]
    if (!round) return

    stopBar()
    const pos = barPosRef.current
    const { perfectZone, goodZone } = round

    let judge
    if (pos >= perfectZone.start && pos <= perfectZone.end) judge = 'PERFECT'
    else if (pos >= goodZone.start && pos <= goodZone.end) judge = 'GOOD'
    else judge = 'MISS'

    const newCombo = judge === 'MISS' ? 0 : combo + 1
    const roundScore = SCORE[judge] + (judge !== 'MISS' ? newCombo * COMBO_BONUS : 0)
    const newScore = score + roundScore
    const newMaxCombo = Math.max(maxCombo, newCombo)

    setJudgment(judge)
    setScore(newScore)
    setCombo(newCombo)
    setMaxCombo(newMaxCombo)
    setResults(prev => [...prev, { round: currentRound + 1, judgment: judge, score: roundScore }])

    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) {
        submitResult(newScore, newMaxCombo, [...results, { round: currentRound + 1, judgment: judge, score: roundScore }])
      } else {
        setCurrentRound(r => r + 1)
      }
    }, 800)
  }, [phase, rounds, currentRound, combo, score, maxCombo, results, stopBar])

  // ── 결과 제출 ──
  const submitResult = async (totalScore, maxComb, allResults) => {
    const perfectCount = allResults.filter(r => r.judgment === 'PERFECT').length
    const goodCount = allResults.filter(r => r.judgment === 'GOOD').length
    const missCount = allResults.filter(r => r.judgment === 'MISS').length

    try {
      const res = await fetch('/api/v1/neoliz/catch/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          gameId,
          results: allResults,
          totalScore,
          maxCombo: maxComb,
          perfectCount,
          goodCount,
          missCount,
          abandoned: false,
        }),
      })
      const data = await res.json()
      setFinalResult({
        totalScore,
        maxCombo: maxComb,
        perfectCount,
        goodCount,
        missCount,
        myResult: data.data.myResult,
        ranking: data.data.ranking,
      })
    } catch {
      // 제출 실패 시에도 클라이언트 집계 결과로 결과 화면 표시
      setFinalResult({ totalScore, maxCombo: maxComb, perfectCount, goodCount, missCount })
    }

    setPhase(PHASE.RESULT)
  }

  // ── 키보드 이벤트 ──
  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'Enter') handleTap() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleTap])

  const currentRoundData = rounds[currentRound] || {}

  return (
    <div style={s.wrap} onClick={phase === PHASE.GAME ? handleTap : undefined}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <video autoPlay loop muted playsInline style={s.bgVideo}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>

      <img src={soundIcon} alt="sound" style={s.soundIcon}
        onError={e => { e.target.style.display = 'none' }} />

      <div style={s.page}>

        {/* ── 대기화면 ── */}
        {phase === PHASE.WAITING && (
          <div style={s.waitingBox}>
            <h1 style={s.title}>MOJILAND</h1>
            <p style={s.howTitle}>How to Play</p>
            <p style={s.howText}>{HOW_TO_PLAY}</p>
            <button style={s.startBtn} onClick={startGame}>START</button>
          </div>
        )}

        {/* ── 카운트다운 ── */}
        {phase === PHASE.COUNTDOWN && (
          <div style={s.countdownWrap}>
            <p style={s.countdownNum}>{countdown === 0 ? 'START!' : countdown}</p>
          </div>
        )}

        {/* ── 게임 진행 ── */}
        {phase === PHASE.GAME && (
          <div style={s.gameWrap}>
            <div style={s.scoreboard}>
              <p style={s.scoreLabel}>SCORE</p>
              <p style={s.scoreVal}>{score}</p>
              <p style={s.scoreLabel}>COMBO</p>
              <p style={s.comboVal}>{combo}</p>
            </div>

            <div style={s.gameArea}>
              <p style={s.roundLabel}>Round {currentRound + 1} / 10</p>

              <div style={s.emojiTrack}>
                {rounds.map((r, i) => (
                  <div key={i} style={{
                    ...s.emojiThumb,
                    border: i === currentRound
                      ? `4px solid ${NEON}`
                      : '3px solid transparent',
                    opacity: i < currentRound ? 0.3 : 1,
                  }}>
                    {r.imageUrl
                      ? <img src={r.imageUrl} alt="" style={s.thumbImg} />
                      : <span style={{ fontSize: 28 }}>🎵</span>}
                  </div>
                ))}
              </div>

              <div style={s.barWrap}>
                <div style={s.barBg}>
                  {currentRoundData.goodZone && currentRoundData.perfectZone && (
                    <>
                      <div style={{ ...s.zone, width: `${currentRoundData.goodZone.start * 100}%`, background: '#e74c3c' }} />
                      <div style={{ ...s.zone, width: `${(currentRoundData.perfectZone.start - currentRoundData.goodZone.start) * 100}%`, background: '#f1c40f' }} />
                      <div style={{ ...s.zone, width: `${(currentRoundData.perfectZone.end - currentRoundData.perfectZone.start) * 100}%`, background: '#2ecc71' }} />
                      <div style={{ ...s.zone, width: `${(currentRoundData.goodZone.end - currentRoundData.perfectZone.end) * 100}%`, background: '#f1c40f' }} />
                      <div style={{ ...s.zone, flex: 1, background: '#e74c3c' }} />
                    </>
                  )}
                  <div ref={markerRef} style={{ ...s.marker, left: '0px' }}>
                    {currentRoundData.imageUrl
                      ? <img src={currentRoundData.imageUrl} alt="" style={s.markerImg} />
                      : <span style={{ fontSize: 32 }}>🎵</span>}
                  </div>
                </div>
                <div style={s.barLabels}>
                  <span>MISS</span><span>GOOD</span><span>PERFECT</span><span>GOOD</span><span>MISS</span>
                </div>
              </div>

              {judgment && (
                <p style={{
                  ...s.judgmentText,
                  color: judgment === 'PERFECT' ? '#2ecc71' : judgment === 'GOOD' ? '#f1c40f' : '#e74c3c',
                }}>
                  {judgment}
                </p>
              )}

              <button style={s.tapBtn} onClick={(e) => { e.stopPropagation(); handleTap() }}>
                TAP / CLICK
              </button>
            </div>
          </div>
        )}

        {/* ── 결과 1단계 ── */}
        {phase === PHASE.RESULT && finalResult && (
          <div style={s.resultBox}>
            <p style={s.gameOver}>GAME OVER</p>
            <p style={s.resultRow}>SCORE <span style={s.resultVal}>{finalResult.totalScore}</span></p>
            <p style={s.resultRow}>MAX COMBO <span style={s.resultVal}>{finalResult.maxCombo}</span></p>
            <p style={s.resultRow}>BEST <span style={s.resultVal}>{finalResult.myResult?.previousBestScore ?? '-'}</span></p>
            {finalResult.myResult?.isPersonalBest && <p style={s.highlight}>🎉 개인 신기록 달성!</p>}
            {finalResult.myResult?.isInRanking && <p style={s.highlight}>🏆 주간 랭킹 진입!</p>}
            <button style={s.nextBtn} onClick={() => setPhase(PHASE.RANKING)}>NEXT →</button>
          </div>
        )}

        {/* ── 결과 2단계: 랭킹 ── */}
        {phase === PHASE.RANKING && (
          <RankingPanel
            rankingData={finalResult?.ranking ?? null}
            onReplay={() => {
              setPhase(PHASE.WAITING)
              setGameId(null)
              setRounds([])
              setCurrentRound(0)
              setResults([])
              setFinalResult(null)
            }}
            onClose={() => navigate('/')}
          />
        )}
      </div>

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        message={modal.message}
        confirmText="확인"
        onConfirm={modal.onConfirm || closeModal}
        cancelText={modal.cancelText}
        onCancel={modal.onCancel}
      />
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', background: BG,
    fontFamily: FONT, color: NEON,
    position: 'relative', overflow: 'hidden',
  },
  bgVideo: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', zIndex: 0, opacity: 0.7,
  },
  soundIcon: {
    position: 'fixed', top: 14, right: 14,
    zIndex: 300, width: 26, height: 26, cursor: 'pointer',
  },
  page: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
  },
  waitingBox: {
    width: '100%', maxWidth: 620,
    border: `2px solid ${NEON}`,
    background: 'rgba(14,14,23,0.95)',
    borderRadius: 4,
    padding: 'clamp(40px, 6vh, 60px) clamp(32px, 5vw, 60px)',
    boxShadow: `8px 8px 0px ${NEON}`,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 'clamp(16px, 3vh, 28px)',
    minHeight: '65vh',
  },
  title: {
    fontSize: 'clamp(10px, 2vw, 16px)', fontWeight: 'bold',
    color: NEON_TEXT, margin: 0,
    letterSpacing: 8, textShadow: `0 0 24px ${NEON}`,
  },
  howTitle: {
    fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 'bold',
    color: NEON_TEXT, margin: 0,
    letterSpacing: 2, textShadow: `0 0 16px ${NEON}`,
  },
  howText: {
    fontSize: 'clamp(12px, 1.2vw, 15px)',
    lineHeight: 1.9, color: NEON_TEXT, opacity: 0.9,
    whiteSpace: 'pre-line', textAlign: 'center', margin: 0,
  },
  startBtn: {
    marginTop: 8,
    padding: 'clamp(14px, 1.5vh, 18px) clamp(48px, 7vw, 80px)',
    background: '#0E0E17',
    border: `2px solid ${NEON}`,
    borderRadius: 4,
    color: NEON_TEXT,
    fontSize: 'clamp(16px, 1.8vw, 22px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: `8px 8px 0px ${NEON}`,
    fontFamily: FONT,
    letterSpacing: 2,
  },
  countdownWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  countdownNum: {
    fontSize: 'clamp(90px, 18vw, 180px)', fontWeight: 'bold',
    color: NEON, textShadow: `0 0 40px ${NEON}`, margin: 0,
  },
  gameWrap: {
    display: 'flex', gap: 'clamp(20px, 3vw, 48px)',
    width: '100%', maxWidth: 1100,
    alignItems: 'stretch',
  },
  scoreboard: {
    width: 'clamp(160px, 18vw, 240px)',
    border: `2px solid ${NEON}`,
    background: 'rgba(14,14,23,0.95)',
    borderRadius: 12,
    padding: '32px 20px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 24, flexShrink: 0,
    boxShadow: `8px 8px 0px ${NEON}`,
    minHeight: 400,
  },
  scoreLabel: {
    fontSize: 'clamp(13px, 1.4vw, 18px)',
    letterSpacing: 4, color: NEON_TEXT, margin: 0, fontFamily: FONT,
  },
  scoreVal: {
    fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 'bold',
    color: NEON, textShadow: `0 0 20px ${NEON}`, margin: 0,
  },
  comboVal: {
    fontSize: 'clamp(48px, 6.5vw, 80px)', fontWeight: 'bold',
    color: NEON, textShadow: `0 0 20px ${NEON}`, margin: 0,
  },
  gameArea: {
    flex: 1,
    border: `2px solid ${NEON}`,
    background: 'rgba(14,14,23,0.95)',
    borderRadius: 20,
    padding: 'clamp(24px, 3.5vh, 40px) clamp(24px, 3vw, 48px)',
    boxShadow: `8px 8px 0px ${NEON}`,
    display: 'flex', flexDirection: 'column',
    gap: 'clamp(14px, 2.5vh, 28px)',
  },
  roundLabel: {
    fontSize: 'clamp(18px, 2vw, 28px)',
    color: NEON_TEXT, textAlign: 'center', margin: 0, fontFamily: FONT,
  },
  emojiTrack: {
    display: 'flex', gap: 'clamp(6px, 1vw, 12px)',
    justifyContent: 'center', flexWrap: 'wrap',
  },
  emojiThumb: {
    width: 'clamp(48px, 6vw, 72px)', height: 'clamp(48px, 6vw, 72px)',
    borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'border 0.15s, opacity 0.15s',
  },
  thumbImg: { width: '75%', height: '75%', objectFit: 'contain', borderRadius: '50%' },
  barWrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  barBg: {
    position: 'relative',
    height: 'clamp(56px, 8vh, 80px)',
    borderRadius: 999,
    display: 'flex', overflow: 'hidden',
    border: `3px solid ${NEON}`,
  },
  zone: { height: '100%' },
  marker: {
    position: 'absolute', top: '50%',
    transform: 'translateY(-50%)',
    width: 64, height: 64,
    borderRadius: '50%', background: '#0E0E17',
    border: `4px solid ${NEON}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10, boxShadow: `0 0 20px ${NEON}`,
  },
  markerImg: { width: '80%', height: '80%', objectFit: 'contain', borderRadius: '50%' },
  barLabels: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0 8px', fontSize: 12, color: NEON_TEXT, opacity: 0.8,
  },
  judgmentText: {
    fontSize: 'clamp(24px, 3vw, 42px)', fontWeight: 'bold',
    textAlign: 'center', margin: 0, fontFamily: FONT, letterSpacing: 4,
    textShadow: '0 0 20px currentColor',
  },
  tapBtn: {
    padding: 'clamp(14px, 1.8vh, 20px) clamp(48px, 7vw, 100px)',
    background: '#0E0E17',
    border: `2px solid ${NEON}`,
    borderRadius: 30,
    color: NEON_TEXT,
    fontSize: 'clamp(14px, 1.6vw, 20px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'center',
    boxShadow: `8px 8px 0px ${NEON}`,
    fontFamily: FONT, letterSpacing: 4,
    marginTop: 'auto',
  },
  resultBox: {
    width: '100%', maxWidth: 520,
    border: `2px solid ${NEON}`,
    background: 'rgba(14,14,23,0.95)',
    borderRadius: 4,
    padding: 'clamp(40px, 6vh, 60px)',
    boxShadow: `8px 8px 0px ${NEON}`,
    textAlign: 'center',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'clamp(10px, 1.8vh, 20px)',
  },
  gameOver: {
    fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 'bold',
    color: NEON, margin: 0, letterSpacing: 4,
    textShadow: `0 0 20px ${NEON}`, fontFamily: FONT,
  },
  resultRow: {
    fontSize: 'clamp(15px, 1.8vw, 22px)',
    margin: 0, color: NEON_TEXT, fontFamily: FONT, letterSpacing: 2,
  },
  resultVal: { color: GOLD, fontWeight: 'bold' },
  highlight: { color: GOLD, fontSize: 'clamp(14px, 1.6vw, 20px)', margin: 0 },
  nextBtn: {
    marginTop: 8,
    padding: 'clamp(12px, 1.4vh, 16px) clamp(40px, 6vw, 64px)',
    background: '#0E0E17',
    border: `2px solid ${NEON}`,
    borderRadius: 4,
    color: NEON_TEXT,
    fontSize: 'clamp(14px, 1.5vw, 20px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: `8px 8px 0px ${NEON}`,
    fontFamily: FONT, letterSpacing: 2,
  },
}

// ──────────────────────────────────────
// 랭킹 패널
// ──────────────────────────────────────
function RankingPanel({ rankingData, onReplay, onClose }) {
  const myNickname = localStorage.getItem('nickname')

  const top5 = rankingData?.top5 ?? []
  const me = rankingData?.me ?? null
  const showMyRow = me && !top5.some(r => r.isMe)

  const top3 = top5.slice(0, 3)
  const rest = top5.slice(3, 5)

  return (
    <div style={sr.box}>
      <p style={sr.weekLabel}>이모지 캐치 주간 랭킹</p>

      {top3.length > 0 && (
        <div style={sr.podium}>
          {top3[1] && <PodiumCard data={top3[1]} />}
          {top3[0] && <PodiumCard data={top3[0]} isFirst />}
          {top3[2] && <PodiumCard data={top3[2]} />}
        </div>
      )}

      <div style={sr.listWrap}>
        {rest.map(item => <RankRow key={item.rank} data={item} />)}
        {showMyRow && me && (
          <div style={{ marginTop: 8 }}>
            <RankRow data={{ ...me, nickname: me.nickname ?? myNickname ?? '나' }} isMe />
          </div>
        )}
      </div>
      {top5.length === 0 && (
        <p style={{ color: NEON_TEXT, opacity: 0.5, fontFamily: FONT, fontSize: 14 }}>
          랭킹 데이터를 불러올 수 없습니다.
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <button style={sr.replayBtn} onClick={onReplay}>Replay</button>
        <button style={{ ...sr.replayBtn, background: 'transparent', color: NEON_TEXT }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function PodiumCard({ data, isFirst = false }) {
  return (
    <div style={{ ...sr.card, ...(isFirst ? sr.cardFirst : sr.cardNormal), borderColor: isFirst ? GOLD : NEON }}>
      {data.isMe && <span style={sr.meBadge}>me</span>}
      <span style={{ ...sr.cardRank, color: isFirst ? GOLD : NEON }}>{data.rank}등</span>
      <span style={sr.cardNickname}>{data.nickname}</span>
      <span style={sr.cardScore}>{data.score?.toLocaleString()}</span>
    </div>
  )
}

function RankRow({ data, isMe = false }) {
  return (
    <div style={{ ...sr.row, borderColor: isMe ? NEON : 'rgba(29,237,131,0.35)' }}>
      {isMe && <span style={sr.meTag}>me</span>}
      <span style={sr.rowRank}>{data.rank}등</span>
      <span style={sr.rowNickname}>{data.nickname}</span>
      <span style={sr.rowScore}>{data.score?.toLocaleString()}</span>
    </div>
  )
}

const sr = {
  box: {
    border: `2px solid ${NEON}`, borderRadius: 16,
    background: 'rgba(0,0,0,0.85)',
    padding: 'clamp(24px, 4vh, 48px) clamp(28px, 4vw, 64px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 'clamp(14px, 2vh, 24px)',
    maxWidth: 640, width: '100%',
    boxShadow: `0 0 40px rgba(29,237,131,0.15)`,
    maxHeight: '90vh', overflowY: 'auto',
  },
  weekLabel: {
    fontSize: 'clamp(14px, 1.4vw, 20px)', letterSpacing: 3,
    color: NEON_TEXT, margin: 0, fontFamily: FONT,
  },
  podium: { display: 'flex', alignItems: 'flex-end', gap: 'clamp(10px, 1.5vw, 20px)' },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '2px solid', borderRadius: 14,
    background: 'rgba(5,15,10,0.85)', position: 'relative',
  },
  cardFirst: {
    width: 'clamp(120px, 14vw, 160px)',
    padding: 'clamp(16px, 2vh, 24px) clamp(12px, 1.5vw, 20px)',
  },
  cardNormal: {
    width: 'clamp(90px, 11vw, 120px)',
    padding: 'clamp(12px, 1.5vh, 18px) clamp(10px, 1.2vw, 16px)',
  },
  meBadge: { position: 'absolute', top: 8, left: 10, color: '#ff4444', fontSize: 12, fontWeight: 'bold' },
  cardRank: { fontSize: 'clamp(18px, 2.2vw, 28px)', fontWeight: 'bold', marginBottom: 8, fontFamily: FONT },
  cardNickname: { color: NEON_TEXT, fontSize: 'clamp(11px, 1.1vw, 14px)', marginBottom: 4, textAlign: 'center', fontFamily: FONT },
  cardScore: { color: NEON_TEXT, fontSize: 'clamp(10px, 1vw, 13px)', opacity: 0.8, fontFamily: FONT },
  listWrap: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' },
  row: {
    display: 'flex', alignItems: 'center', border: '1px solid', borderRadius: 30,
    padding: 'clamp(8px, 1vh, 12px) clamp(16px, 2vw, 24px)',
    background: 'rgba(5,15,10,0.75)', gap: 16,
  },
  meTag: { color: '#ff4444', fontSize: 12, fontWeight: 'bold', minWidth: 20, fontFamily: FONT },
  rowRank: { color: NEON, fontSize: 'clamp(13px, 1.3vw, 17px)', fontWeight: 'bold', minWidth: 40, fontFamily: FONT },
  rowNickname: { color: NEON_TEXT, fontSize: 'clamp(12px, 1.2vw, 16px)', flex: 1, fontFamily: FONT },
  rowScore: { color: NEON_TEXT, fontSize: 'clamp(11px, 1.1vw, 15px)', opacity: 0.8, fontFamily: FONT },
  replayBtn: {
    padding: 'clamp(10px, 1.2vh, 16px) clamp(28px, 4vw, 56px)',
    border: `2px solid ${NEON}`, borderRadius: 10,
    background: 'rgba(0,0,0,0.5)', color: NEON_TEXT,
    fontSize: 'clamp(13px, 1.3vw, 18px)', fontWeight: 'bold',
    cursor: 'pointer', fontFamily: FONT, letterSpacing: 2,
  },
}