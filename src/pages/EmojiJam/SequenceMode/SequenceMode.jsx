import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const CATEGORIES = ['동물', 'HUFS', '게임', '밈']
const CATEGORY_MAP = { '동물': 'animal', 'HUFS': 'hufs', '게임': 'game', '밈': 'meme' }
const MULTIPLIERS = [0.5, 1, 1.5, 2]
const MAX_SLOTS = 4

// 이모지 이미지 렌더 헬퍼 (API는 항상 imageUrl 반환)
function EmojiImg({ emoji, style }) {
  if (!emoji?.imageUrl) return null
  return <img src={emoji.imageUrl} alt={emoji.name} style={style} />
}

// 빈 슬롯 초기값
const EMPTY_SLOT = { emoji: null, multiplier: 1 }
const initSlots = () => Array.from({ length: MAX_SLOTS }, () => ({ ...EMPTY_SLOT }))

export default function SequenceMode() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('동물')
  const [emojiList, setEmojiList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [slots, setSlots] = useState(initSlots())
  const slotsRef = useRef(slots)
  useEffect(() => { slotsRef.current = slots }, [slots])

  const [playingIdx, setPlayingIdx] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playTimerRef = useRef(null)

  // 모달 상태
  const [showFullModal, setShowFullModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [seqTitle, setSeqTitle] = useState('')
  const [saveResult, setSaveResult] = useState(null) // 'success' | 'error' | null

  // 드래그앤드롭
  const draggingEmoji = useRef(null)

  // 카테고리 변경 시 목록 조회
  useEffect(() => {
    const fetchEmojis = async () => {
      setLoadingList(true)
      setEmojiList([])
      try {
        const res = await fetch(`/api/v1/neoliz/emojis?category=${CATEGORY_MAP[selectedCategory]}`)
        const json = await res.json()
        setEmojiList(json.data?.emojis ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingList(false)
      }
    }
    fetchEmojis()
  }, [selectedCategory])

  const handleDragStart = (emoji) => {
    if (isPlaying) return
    draggingEmoji.current = emoji
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = (slotIdx) => {
    const emoji = draggingEmoji.current
    if (!emoji) return
    draggingEmoji.current = null

    const current = slotsRef.current
    const isOccupied = current[slotIdx].emoji !== null

    if (!isOccupied) {
      const filled = current.filter(s => s.emoji !== null).length
      if (filled >= MAX_SLOTS) {
        setShowFullModal(true)
        return
      }
    }

    setSlots(prev => {
      const next = [...prev]
      next[slotIdx] = { emoji, multiplier: prev[slotIdx].multiplier || 1 }
      const filledAfter = next.filter(s => s.emoji !== null).length
      if (filledAfter >= MAX_SLOTS) setTimeout(() => setShowFullModal(true), 0)
      return next
    })
  }

  // 배율 변경 (재생 중 lock)
  const handleMultiplier = (slotIdx, val) => {
    if (isPlaying) return
    setSlots(prev => {
      const next = [...prev]
      next[slotIdx] = { ...next[slotIdx], multiplier: val }
      return next
    })
  }

  // 재생 (soundUrl 활용)
  const handlePlay = () => {
    if (isPlaying) return
    const filled = slots.map((s, i) => ({ ...s, i })).filter(s => s.emoji)
    if (filled.length === 0) return
    setIsPlaying(true)
    let step = 0
    const next = () => {
      if (step >= filled.length) {
        setPlayingIdx(null)
        setIsPlaying(false)
        return
      }
      setPlayingIdx(filled[step].i)
      // soundUrl로 실제 오디오 재생
      if (filled[step].emoji?.soundUrl) {
        const audio = new Audio(filled[step].emoji.soundUrl)
        audio.play().catch(() => {})
      }
      // multiplier 기반 재생 간격 (기본 800ms 기준)
      const interval = 800 * (filled[step].multiplier ?? 1)
      playTimerRef.current = setTimeout(() => {
        step++
        next()
      }, interval)
    }
    next()
  }

  // 정지
  const handleStop = () => {
    clearTimeout(playTimerRef.current)
    setPlayingIdx(null)
    setIsPlaying(false)
  }

  // 전체 삭제
  const handleDeleteConfirm = () => {
    setSlots(initSlots())
    setShowDeleteModal(false)
    handleStop()
  }

  // 저장
  const handleSave = async () => {
    if (!seqTitle.trim()) return
    try {
      const items = slots
        .filter(s => s.emoji !== null)
        .map(s => ({ emojiId: s.emoji.id, multiplier: s.multiplier }))
      const res = await fetch('/api/v1/neoliz/users/me/sequences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ title: seqTitle, items }),
      })
      if (res.ok) setSaveResult('success')
      else setSaveResult('error')
    } catch {
      setSaveResult('error')
    }
  }

  const closeSaveModal = () => {
    setShowSaveModal(false)
    setSeqTitle('')
    setSaveResult(null)
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
        .emoji-list::-webkit-scrollbar { width: 8px; }
        .emoji-list::-webkit-scrollbar-track { background: transparent; }
        .emoji-list::-webkit-scrollbar-thumb { background: #1DED83; border-radius: 999px; border: 1px solid #062b1d; }
        .emoji-list::-webkit-scrollbar-thumb:hover { background: #5dffb0; }
      `}</style>

      {/* 배경 영상 */}
      <video autoPlay loop muted style={s.bgVideo}>
        <source src="/src/assets/Neon-grid-crop.mp4" type="video/mp4" />
      </video>

      {/* 우상단 사운드 */}
      <img src="/src/assets/sound.png" alt="sound" style={s.soundIcon}
        onError={e => { e.target.style.display = 'none' }} />

      <div style={s.page}>

        {/* ── 상단 모드탭 ── */}
        <div style={s.topBar}>
          <div style={s.tabTrack}>
            <div style={{ ...s.tabSlider, left: 'calc(50% + 3px)' }} />
            <button style={s.tabInactive} onClick={() => navigate('/emoji-jam')}>자유모드</button>
            <button style={s.tabActive}>시퀀스모드</button>
          </div>
        </div>

        {/* 본문: 좌 + 우 */}
        <div style={s.body}>

          {/* ── 왼쪽: 카테고리 + 이모지 리스트 ── */}
          <div style={s.left}>
            <p style={s.secLabel}>CATEGORY</p>
            <div style={s.catRow}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...s.catBtn,
                    background: selectedCategory === cat ? NEON : 'transparent',
                    color: selectedCategory === cat ? BG : NEON_TEXT,
                    fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            <p style={s.secLabel}>EMOJI</p>
            {/* 스크롤 가능한 이모지 2열 그리드 */}
            <div className="emoji-list" style={s.emojiList}>
              {loadingList ? (
                <p style={{ color: NEON_TEXT, opacity: 0.6, gridColumn: '1/-1', fontFamily: FONT, fontSize: 14 }}>
                  로딩 중...
                </p>
              ) : (
                emojiList.map(emoji => (
                  <div key={emoji.id} draggable={!isPlaying}
                    onDragStart={() => handleDragStart(emoji)}
                    style={{
                      ...s.emojiListCell,
                      opacity: isPlaying ? 0.4 : 1,
                      cursor: isPlaying ? 'not-allowed' : 'grab',
                    }}>
                    <EmojiImg emoji={emoji} style={s.emojiImg} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── 오른쪽: SEQUENCE DIY ── */}
          <div style={s.right}>
            <div style={s.rightTop}>
              <p style={s.seqTitle}>SEQUENCE DIY</p>
              <p style={s.seqSub}>EMOJI를 드래그 앤 드롭한 후 속도를 선택해 주세요.</p>

              {/* 4칸 슬롯 + 배율 버튼 */}
              <div style={s.slotRow}>
                {slots.map((slot, i) => (
                  <div key={i} style={s.slotCol}>
                    {/* 이모지 슬롯 */}
                    <div onDragOver={handleDragOver} onDrop={() => handleDrop(i)}
                      style={{
                        ...s.slotBox,
                        border: playingIdx === i ? `3px solid #fff` : `2px solid ${NEON}`,
                        boxShadow: playingIdx === i ? `0 0 18px #fff` : `4px 4px 0 ${NEON}`,
                        background: slot.emoji ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)',
                      }}>
                      {slot.emoji
                        ? <EmojiImg emoji={slot.emoji} style={s.slotImg} />
                        : <span style={s.slotEmpty}>+</span>}
                    </div>

                    {/* 배율 버튼 2x2 (재생 중 비활성화) */}
                    <div style={s.multGrid}>
                      {MULTIPLIERS.map(m => (
                        <button key={m} onClick={() => handleMultiplier(i, m)}
                          disabled={isPlaying}
                          style={{
                            ...s.multBtn,
                            background: slot.multiplier === m ? NEON : 'transparent',
                            color: slot.multiplier === m ? BG : NEON_TEXT,
                            fontWeight: slot.multiplier === m ? 'bold' : 'normal',
                            opacity: isPlaying ? 0.4 : 1,
                            cursor: isPlaying ? 'not-allowed' : 'pointer',
                          }}>
                          x {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 하단 컨트롤 버튼 4개: 정지 / 재생 / 저장 / 삭제 ── */}
            <div style={s.ctrlRow}>
              {/* 정지 */}
              <button style={s.ctrlBtn} onClick={handleStop} title="정지">
                <div style={s.stopIcon} />
              </button>
              {/* 재생 */}
              <button style={s.ctrlBtn} onClick={handlePlay} title="재생">
                <div style={s.playIcon} />
              </button>
              {/* 저장: 이모지 1개 이상이면 활성화 */}
              <button
                style={{
                  ...s.ctrlBtn,
                  opacity: slots.some(s => s.emoji) ? 1 : 0.4,
                  cursor: slots.some(s => s.emoji) ? 'pointer' : 'not-allowed',
                }}
                onClick={() => { if (slots.some(s => s.emoji)) setShowSaveModal(true) }}
                title="저장">
                <div style={s.saveIcon}><div style={s.saveIconInner} /></div>
              </button>
              {/* 삭제: 재생 중 lock */}
              <button
                style={{
                  ...s.ctrlBtn,
                  opacity: isPlaying ? 0.4 : 1,
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                }}
                onClick={() => { if (!isPlaying) setShowDeleteModal(true) }}
                title="전체 삭제">
                <div style={s.trashIcon}>
                  <div style={s.trashLid} />
                  <div style={s.trashBody} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 모달: 4칸 꽉 찼을 때 ── */}
      {showFullModal && (
        <div style={s.modalOverlay} onClick={() => setShowFullModal(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <p style={s.modalText}>{'더 이상 추가할 수 없어요!\n전체 삭제 후 새로 만들어보세요.'}</p>
            <button style={s.modalBtn} onClick={() => setShowFullModal(false)}>확인</button>
          </div>
        </div>
      )}

      {/* ── 모달: 전체 삭제 확인 ── */}
      {showDeleteModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <p style={s.modalText}>전체 삭제하시겠습니까?</p>
            <div style={s.modalBtnRow}>
              <button style={s.modalBtn} onClick={handleDeleteConfirm}>YES</button>
              <button style={{ ...s.modalBtn, background: 'transparent', color: NEON_TEXT }}
                onClick={() => setShowDeleteModal(false)}>NO</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 모달: 저장 ── */}
      {showSaveModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            {saveResult === 'success' ? (
              <>
                <p style={s.modalText}>저장되었습니다.</p>
                <button style={s.modalBtn} onClick={closeSaveModal}>확인</button>
              </>
            ) : saveResult === 'error' ? (
              <>
                <p style={s.modalText}>{'저장에 실패했습니다.\n다시 시도해 주세요.'}</p>
                <button style={s.modalBtn} onClick={() => setSaveResult(null)}>다시 시도</button>
                <button style={{ ...s.modalBtn, marginTop: 8, background: 'transparent', color: NEON_TEXT }}
                  onClick={closeSaveModal}>취소</button>
              </>
            ) : (
              <>
                <p style={s.modalText}>저장하시겠습니까?</p>
                <p style={{ ...s.modalText, fontSize: 15, marginBottom: 8 }}>SEQUENCE NAME</p>
                <input style={s.modalInput} placeholder="시퀀스명을 입력하세요"
                  value={seqTitle} onChange={e => setSeqTitle(e.target.value)} maxLength={20} />
                <button style={s.modalBtn} onClick={handleSave}>Save</button>
                <button style={{ ...s.modalBtn, marginTop: 8, background: 'transparent', color: NEON_TEXT }}
                  onClick={closeSaveModal}>취소</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', background: BG,
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
    display: 'flex', flexDirection: 'column',
    height: '100vh',
    padding: 'clamp(16px, 2.2vh, 32px) clamp(20px, 3.5vw, 48px)',
    overflow: 'hidden',
  },

  topBar: {
    display: 'flex', justifyContent: 'center',
    marginBottom: 'clamp(14px, 2.2vh, 32px)', flexShrink: 0,
  },
  tabTrack: {
    position: 'relative', display: 'flex',
    width: 280, height: 44,
    border: `2px solid ${NEON}`, borderRadius: 999,
    overflow: 'hidden', background: 'transparent',
  },
  tabSlider: {
    position: 'absolute', top: 3,
    width: 'calc(50% - 6px)', height: 'calc(100% - 6px)',
    background: NEON, borderRadius: 999, zIndex: 1,
  },
  tabActive: {
    flex: 1, background: 'transparent', border: 'none',
    color: BG, fontWeight: 'bold', fontSize: 14,
    zIndex: 2, cursor: 'default', fontFamily: FONT, letterSpacing: 1,
  },
  tabInactive: {
    flex: 1, background: 'transparent', border: 'none',
    color: NEON_TEXT, fontSize: 14,
    zIndex: 2, cursor: 'pointer', fontFamily: FONT, letterSpacing: 1,
  },

  body: {
    display: 'flex', gap: 'clamp(20px, 3vw, 40px)',
    flex: 1, minHeight: 0, overflow: 'hidden',
  },

  left: {
    width: 'clamp(220px, 24vw, 320px)',
    display: 'flex', flexDirection: 'column',
    minWidth: 0, overflow: 'hidden', flexShrink: 0,
  },
  secLabel: {
    fontSize: 'clamp(13px, 1.4vw, 20px)',
    fontWeight: 'bold', letterSpacing: 4, color: NEON_TEXT,
    margin: '0 0 clamp(6px, 0.8vh, 12px)', flexShrink: 0, fontFamily: FONT,
  },
  catRow: {
    display: 'flex', gap: 'clamp(4px, 0.6vw, 8px)',
    marginBottom: 'clamp(8px, 1.4vh, 20px)', flexShrink: 0, flexWrap: 'wrap',
  },
  catBtn: {
    padding: 'clamp(6px, 0.8vh, 10px) clamp(10px, 1.3vw, 20px)',
    border: `2px solid ${NEON}`, borderRadius: 12,
    fontSize: 'clamp(10px, 1.05vw, 14px)',
    cursor: 'pointer', fontFamily: FONT, letterSpacing: 1, transition: 'all 0.15s',
  },
  emojiList: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'clamp(4px, 0.5vw, 8px)',
    overflowY: 'auto', flex: 1, padding: '2px 10px 2px 2px',
  },
  emojiListCell: {
    border: `2px solid ${NEON}`, borderRadius: 10,
    background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'clamp(6px, 0.7vw, 12px)',
    aspectRatio: '1 / 1',
    transition: 'box-shadow 0.13s, opacity 0.13s',
    boxShadow: `3px 3px 0 ${NEON}`,
  },
  emojiImg: { width: '80%', height: '80%', objectFit: 'contain' },

  right: {
    flex: 1, display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    paddingTop: 'clamp(36px, 14vh, 140px)',
    gap: 'clamp(28px, 6vh, 50px)',
  },
  rightTop: {
    display: 'flex',
    flexDirection: 'column',
  },
  seqTitle: {
    fontSize: 'clamp(16px, 1.8vw, 26px)', fontWeight: 'bold',
    letterSpacing: 3, color: NEON_TEXT, margin: '0 0 6px', fontFamily: FONT,
  },
  seqSub: {
    fontSize: 'clamp(11px, 1.1vw, 16px)', color: NEON_TEXT,
    opacity: 0.7, margin: '0 0 clamp(16px, 2.5vh, 32px)', fontFamily: FONT,
  },

  slotRow: {
    display: 'flex', gap: 'clamp(10px, 1.5vw, 24px)',
    flexShrink: 0,
  },
  slotCol: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'clamp(8px, 1vh, 14px)',
    flex: 1,
  },
  slotBox: {
    width: '100%', aspectRatio: '1 / 1', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'box-shadow 0.15s, border 0.15s', cursor: 'default',
  },
  slotImg: { width: '75%', height: '75%', objectFit: 'contain' },
  slotEmpty: { fontSize: 'clamp(20px, 2.5vw, 36px)', color: NEON_TEXT, opacity: 0.3 },

  multGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 'clamp(4px, 0.4vw, 6px)', width: '100%',
  },
  multBtn: {
    border: `2px solid ${NEON}`, borderRadius: 8,
    fontSize: 'clamp(10px, 0.9vw, 13px)',
    padding: 'clamp(4px, 0.5vh, 7px) 0',
    fontFamily: FONT, transition: 'all 0.12s',
  },

  ctrlRow: {
    display: 'flex', gap: 'clamp(18px, 3vw, 40px)',
    justifyContent: 'center',
    marginTop: 'clamp(16px, 2.5vh, 32px)',
    flexShrink: 0,
  },
  ctrlBtn: {
    width: 'clamp(44px, 5vw, 64px)', height: 'clamp(44px, 5vw, 64px)',
    border: `2px solid ${NEON}`, borderRadius: 10,
    background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `3px 3px 0 ${NEON}`, transition: 'box-shadow 0.12s, opacity 0.12s',
  },

  stopIcon: {
    width: 'clamp(14px, 1.6vw, 22px)', height: 'clamp(14px, 1.6vw, 22px)',
    background: NEON, borderRadius: 2,
  },
  playIcon: {
    width: 0, height: 0,
    borderTop: 'clamp(9px, 1vw, 13px) solid transparent',
    borderBottom: 'clamp(9px, 1vw, 13px) solid transparent',
    borderLeft: `clamp(15px, 1.7vw, 22px) solid ${NEON}`,
    marginLeft: 4,
  },
  saveIcon: {
    width: 'clamp(16px, 1.8vw, 24px)', height: 'clamp(16px, 1.8vw, 24px)',
    border: `2.5px solid ${NEON}`, borderRadius: 2,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    paddingBottom: 2,
  },
  saveIconInner: { width: '55%', height: '45%', border: `2px solid ${NEON}`, borderRadius: 1 },
  trashIcon: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  trashLid: {
    width: 'clamp(16px, 1.8vw, 24px)', height: 'clamp(3px, 0.3vw, 4px)',
    background: NEON, borderRadius: 2,
  },
  trashBody: {
    width: 'clamp(12px, 1.4vw, 18px)', height: 'clamp(12px, 1.4vw, 16px)',
    border: `2.5px solid ${NEON}`, borderRadius: '0 0 3px 3px',
  },

  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
  },
  modalBox: {
    border: `2px solid ${NEON}`, borderRadius: 16,
    background: 'rgba(6,14,11,0.97)',
    padding: 'clamp(24px, 3vw, 40px) clamp(28px, 4vw, 56px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, minWidth: 'clamp(260px, 30vw, 420px)',
    boxShadow: `0 0 32px rgba(29,237,131,0.25)`,
  },
  modalText: {
    fontSize: 'clamp(16px, 1.6vw, 22px)', color: NEON_TEXT,
    fontFamily: FONT, textAlign: 'center', whiteSpace: 'pre-line', margin: 0,
  },
  modalBtn: {
    padding: 'clamp(10px, 1vh, 14px) clamp(28px, 3vw, 48px)',
    border: `2px solid ${NEON}`, borderRadius: 10,
    background: NEON, color: BG,
    fontSize: 'clamp(14px, 1.4vw, 18px)', fontWeight: 'bold',
    fontFamily: FONT, cursor: 'pointer', width: '100%',
  },
  modalBtnRow: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' },
  modalInput: {
    width: '100%', padding: 'clamp(10px, 1vh, 14px) 14px',
    border: `2px solid ${NEON}`, borderRadius: 8,
    background: 'rgba(0,0,0,0.5)', color: NEON_TEXT,
    fontSize: 'clamp(14px, 1.3vw, 17px)', fontFamily: FONT, outline: 'none',
  },
}