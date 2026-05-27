import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/index'
import neonGridVideo from '../../../assets/Neon-grid-crop.mp4'
import soundIcon from '../../../assets/sound.png'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'

const CATEGORIES = ['동물', 'HUFS', '게임', '밈']
const CATEGORY_MAP = { '동물': 'animal', 'HUFS': 'hufs', '게임': 'game', '밈': 'meme' }

export default function FreeMode() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('동물')
  const [emojiList, setEmojiList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [clickedIdx, setClickedIdx] = useState(null)

  useEffect(() => {
    const fetchEmojis = async () => {
      setLoadingList(true)
      setEmojiList([])
      setSelectedEmoji(null)
      try {
        const res = await api.get(`/api/v1/neoliz/emojis?category=${CATEGORY_MAP[selectedCategory]}`)
        const list = res.data?.data?.emojis ?? []
        setEmojiList(list)
        if (list.length > 0) fetchDetail(list[0].id, selectedCategory)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingList(false)
      }
    }
    fetchEmojis()
  }, [selectedCategory])

  const fetchDetail = async (id, category) => {
    setLoadingDetail(true)
    try {
      const res = await api.get(`/api/v1/neoliz/emojis/${id}`)
      setSelectedEmoji({ ...res.data?.data, category })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleEmojiClick = (emoji, idx) => {
    setClickedIdx(idx)
    fetchDetail(emoji.id, selectedCategory)
    setTimeout(() => setClickedIdx(null), 160)
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <video autoPlay loop muted style={s.bgVideo}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>

      <img src={soundIcon} alt="sound" style={s.soundIcon} />

      <div style={s.page}>
        <div style={s.topBar}>
          <div style={s.tabTrack}>
            <div style={s.tabSlider} />
            <button style={s.tabActive}>자유모드</button>
            <button style={s.tabInactive} onClick={() => navigate('/emoji-jam/sequence')}>
              시퀀스모드
            </button>
          </div>
        </div>

        <div style={s.body}>
          <div style={s.left}>
            <p style={s.secLabel}>CATEGORY</p>
            <div style={s.catRow}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...s.catBtn,
                    background: selectedCategory === cat ? NEON : 'transparent',
                    color: selectedCategory === cat ? BG : NEON_TEXT,
                    fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p style={s.secLabel}>EMOJI</p>
            <div style={s.grid}>
              {loadingList ? (
                <p style={{ color: NEON_TEXT, opacity: 0.6, gridColumn: '1/-1', fontFamily: FONT, fontSize: 14 }}>
                  로딩 중...
                </p>
              ) : (
                emojiList.map((emoji, i) => (
                  <button
                    key={emoji.id}
                    onClick={() => handleEmojiClick(emoji, i)}
                    style={{
                      ...s.cell,
                      transform: clickedIdx === i ? 'scale(0.88) translateY(4px)' : 'scale(1)',
                      boxShadow: clickedIdx === i ? `2px 2px 0px ${NEON}` : `6px 6px 0px ${NEON}`,
                    }}
                  >
                    <img src={emoji.imageUrl} alt={emoji.name} style={s.emojiImg} />
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={s.right}>
            <div style={s.panel}>
              <p style={s.panelLabel}>NOW PLAYING</p>
              {loadingDetail ? (
                <p style={{ color: NEON_TEXT, opacity: 0.6, fontFamily: FONT, fontSize: 14 }}>로딩 중...</p>
              ) : selectedEmoji ? (
                <div style={s.nowRow}>
                  <div style={s.nowImgBox}>
                    <img src={selectedEmoji.imageUrl} alt={selectedEmoji.name} style={s.nowImg} />
                  </div>
                  <div style={s.nowTextBox}>
                    <p style={s.nowCat}>{selectedEmoji.category}</p>
                    <p style={s.nowName}>{selectedEmoji.name}</p>
                    <div style={s.nowDescBox}>
                      <p style={s.nowDescText}>{selectedEmoji.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={s.emptyText}>이모지를 선택해주세요</p>
              )}
            </div>

            <button style={s.seqBtn} onClick={() => navigate('/emoji-jam/sequence')}>
              <span>시퀀스 생성하기</span>
              <span style={{ fontSize: 22 }}>›</span>
            </button>

            <div style={s.panel}>
              <p style={s.panelLabel}>HOW TO PLAY</p>
              <p style={s.howText}>
                {'4가지 카테고리를 만나보세요!\nEMOJI를 클릭하면 바로 재생됩니다.\n자유 모드에서 시퀀스 모드로 바꿔\n나만의 시퀀스를 만들어보세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: BG,
    fontFamily: FONT,
    color: NEON,
    position: 'relative',
    overflow: 'hidden',
  },
  bgVideo: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    opacity: 0.7,
  },
  soundIcon: {
    position: 'fixed',
    top: 14, right: 14,
    zIndex: 300,
    width: 26, height: 26,
    cursor: 'pointer',
  },
  page: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: 'clamp(16px, 2.2vh, 32px) clamp(20px, 3.5vw, 48px)',
    overflow: 'hidden',
  },

  topBar: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 'clamp(14px, 2.2vh, 32px)',
    flexShrink: 0,
  },
  tabTrack: {
    position: 'relative',
    display: 'flex',
    width: 280,
    height: 44,
    border: `2px solid ${NEON}`,
    borderRadius: 999,
    overflow: 'hidden',
    background: 'transparent',
  },
  tabSlider: {
    position: 'absolute',
    top: 3, left: 3,
    width: 'calc(50% - 6px)',
    height: 'calc(100% - 6px)',
    background: NEON,
    borderRadius: 999,
    zIndex: 1,
  },
  tabActive: {
    flex: 1, background: 'transparent', border: 'none',
    color: BG, fontWeight: 'bold', fontSize: 14,
    zIndex: 2, cursor: 'default', fontFamily: FONT,
    letterSpacing: 1,
  },
  tabInactive: {
    flex: 1, background: 'transparent', border: 'none',
    color: NEON_TEXT, fontSize: 14,
    zIndex: 2, cursor: 'pointer', fontFamily: FONT,
    letterSpacing: 1,
  },

  body: {
    display: 'flex',
    gap: 'clamp(20px, 3vw, 40px)',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    alignItems: 'stretch',
  },

  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  secLabel: {
    fontSize: 'clamp(13px, 1.4vw, 20px)',
    fontWeight: 'bold',
    letterSpacing: 4,
    color: NEON_TEXT,
    margin: '0 0 clamp(10px, 1.6vh, 22px)',
    flexShrink: 0,
    fontFamily: FONT,
  },
  catRow: {
    display: 'flex',
    gap: 'clamp(6px, 0.8vw, 12px)',
    marginBottom: 'clamp(8px, 1.4vh, 20px)',
    flexShrink: 0,
  },
  catBtn: {
    padding: 'clamp(9px, 0.5vh, 8px) clamp(12px, 1.6vw, 30px)',
    border: `2px solid ${NEON}`,
    borderRadius: 12,
    fontSize: 'clamp(11px, 1.05vw, 16px)',
    cursor: 'pointer',
    fontFamily: FONT,
    letterSpacing: 1,
    transition: 'all 0.15s',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    columnGap: 'clamp(8px, 1.1vw, 14px)',
    rowGap: 'clamp(1px, 0.0vw, 2px)',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: '2px',
    alignContent: 'stretch',
  },

  cell: {
    border: `2px solid ${NEON}`,
    borderRadius: 10,
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.13s, box-shadow 0.13s',
    overflow: 'hidden',
    padding: 'clamp(5px, 0.6vw, 10px)',
    aspectRatio: '1 / 1',
    width: '94%',
    maxHeight: '94%',
  },

  emojiImg: {
    width: '78%',
    height: '78%',
    objectFit: 'contain',
  },

  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(12px, 1.8vh, 30px)',
    minWidth: 0,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    paddingTop: 'clamp(80px, 16vh, 280px)',
  },

  panel: {
    border: `2px solid ${NEON}`,
    borderRadius: 12,
    padding: '20px 30px',
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)',
    flexShrink: 0,
    minHeight: 'clamp(180px, 22vh, 260px)',
  },
  panelLabel: {
    fontSize: 'clamp(13px, 1.4vw, 20px)',
    letterSpacing: 3,
    color: NEON_TEXT,
    margin: '0 0 clamp(8px, 1vh, 14px)',
    fontFamily: FONT,
  },

  nowRow: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },

  nowImgBox: {
    width: 'clamp(90px, 9vw, 100px)',
    height: 'clamp(180px, 20vh, 280px)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
  },

  nowImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  nowTextBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },

  nowCat: {
    fontSize: 'clamp(12px, 1.1vw, 15px)',
    color: NEON_TEXT,
    opacity: 0.6,
    margin: 0,
    fontFamily: FONT,
    letterSpacing: 2,
  },

  nowName: {
    fontSize: 'clamp(18px, 1.8vw, 26px)',
    fontWeight: 'bold',
    color: NEON_TEXT,
    margin: '4px 0 10px 0',
    fontFamily: FONT,
    lineHeight: 1.2,
  },

  nowDescBox: {
    background: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    padding: '12px 14px',
    marginTop: 'auto',
  },

  nowDescText: {
    fontSize: 'clamp(13.5px, 1.2vw, 17.5px)',
    lineHeight: 1.65,
    color: NEON_TEXT,
    whiteSpace: 'pre-line',
    margin: 0,
    fontFamily: FONT,
  },

  emptyText: {
    color: NEON_TEXT,
    opacity: 0.5,
    fontFamily: FONT,
    fontSize: 'clamp(13px, 1.2vw, 16px)',
  },

  seqBtn: {
    width: '100%',
    padding: 'clamp(16px, 1.1vh, 16px) clamp(18px, 1.7vw, 24px)',
    border: `2px solid ${NEON}`,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.45)',
    color: NEON_TEXT,
    fontSize: 'clamp(12px, 1.8vw, 15.5px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    letterSpacing: 1,
    flexShrink: 0,
  },

  howText: {
    fontSize: 'clamp(16px, 1.3vw, 20px)',
    lineHeight: 2.1,
    whiteSpace: 'pre-line',
    color: NEON_TEXT,
    margin: 0,
    fontFamily: FONT,
  },
}