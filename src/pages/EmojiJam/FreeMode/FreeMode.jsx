import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'

const CATEGORIES = ['동물', 'HUFS', '게임', '밈']

const EMOJI_IMAGES = {
  동물: [
    { name: '고라니', imageUrl: '/src/assets/emojis/animals/animal_1.png', description: 'ㅜㄲ에에엥에게게ㅔ에ㅔ게라이' },
    { name: '고양이', imageUrl: '/src/assets/emojis/animals/animal_2.png', description: '야야야야야아아아ㅏㅇ아라라라라랄라오오옹ㅇㅇ미야오옹오옹' },
    { name: '개', imageUrl: '/src/assets/emojis/animals/animal_3.png', description: '동물 이모지 설명' },
    { name: '닭', imageUrl: '/src/assets/emojis/animals/animal_4.png', description: '동물 이모지 설명' },
    { name: '물개', imageUrl: '/src/assets/emojis/animals/animal_5.png', description: '동물 이모지 설명' },
    { name: '사자', imageUrl: '/src/assets/emojis/animals/animal_6.png', description: '동물 이모지 설명' },
    { name: '소', imageUrl: '/src/assets/emojis/animals/animal_7.png', description: '동물 이모지 설명' },
    { name: '알파카', imageUrl: '/src/assets/emojis/animals/animal_8.png', description: '동물 이모지 설명' },
    { name: '양', imageUrl: '/src/assets/emojis/animals/animal_9.png', description: '동물 이모지 설명' },
    { name: '염소', imageUrl: '/src/assets/emojis/animals/animal_10.png', description: '동물 이모지 설명' },
    { name: '카피바라', imageUrl: '/src/assets/emojis/animals/animal_11.png', description: '동물 이모지 설명' },
    { name: '코끼리', imageUrl: '/src/assets/emojis/animals/animal_12.png', description: '동물 이모지 설명' },
  ],
  HUFS: [
    { name: 'HUFS1', imageUrl: '/src/assets/emojis/hufs/01.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS2', imageUrl: '/src/assets/emojis/hufs/02.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS3', imageUrl: '/src/assets/emojis/hufs/03.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS4', imageUrl: '/src/assets/emojis/hufs/04.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS5', imageUrl: '/src/assets/emojis/hufs/05.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS6', imageUrl: '/src/assets/emojis/hufs/06.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS7', imageUrl: '/src/assets/emojis/hufs/07.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS8', imageUrl: '/src/assets/emojis/hufs/08.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS9', imageUrl: '/src/assets/emojis/hufs/09.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS10', imageUrl: '/src/assets/emojis/hufs/10.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS11', imageUrl: '/src/assets/emojis/hufs/11.svg', description: 'HUFS 이모지 설명' },
    { name: 'HUFS12', imageUrl: '/src/assets/emojis/hufs/12.svg', description: 'HUFS 이모지 설명' },
  ],
  게임: [
    { name: '게임1', emoji: '🎮', description: '게임 이모지 설명' },
    { name: '게임2', emoji: '🕹️', description: '게임 이모지 설명' },
    { name: '게임3', emoji: '🎯', description: '게임 이모지 설명' },
    { name: '게임4', emoji: '🎲', description: '게임 이모지 설명' },
    { name: '게임5', emoji: '🃏', description: '게임 이모지 설명' },
    { name: '게임6', emoji: '🎳', description: '게임 이모지 설명' },
    { name: '게임7', emoji: '🏆', description: '게임 이모지 설명' },
    { name: '게임8', emoji: '🎪', description: '게임 이모지 설명' },
    { name: '게임9', emoji: '🎰', description: '게임 이모지 설명' },
    { name: '게임10', emoji: '🧩', description: '게임 이모지 설명' },
    { name: '게임11', emoji: '🎱', description: '게임 이모지 설명' },
    { name: '게임12', emoji: '⚔️', description: '게임 이모지 설명' },
  ],
  밈: [
    { name: '밈1', imageUrl: '/src/assets/emojis/meme_1.png', description: '밈 이모지 설명' },
    { name: '밈2', imageUrl: '/src/assets/emojis/meme_2.png', description: '밈 이모지 설명' },
    { name: '밈3', imageUrl: '/src/assets/emojis/meme_3.png', description: '밈 이모지 설명' },
    { name: '밈4', imageUrl: '/src/assets/emojis/meme_4.png', description: '밈 이모지 설명' },
    { name: '밈5', imageUrl: '/src/assets/emojis/meme_5.png', description: '밈 이모지 설명' },
    { name: '밈6', imageUrl: '/src/assets/emojis/meme_6.png', description: '밈 이모지 설명' },
    { name: '밈7', imageUrl: '/src/assets/emojis/meme_7.png', description: '밈 이모지 설명' },
    { name: '밈8', imageUrl: '/src/assets/emojis/meme_8.png', description: '밈 이모지 설명' },
    { name: '밈9', imageUrl: '/src/assets/emojis/meme_9.png', description: '밈 이모지 설명' },
    { name: '밈10', imageUrl: '/src/assets/emojis/meme_10.png', description: '밈 이모지 설명' },
    { name: '밈11', imageUrl: '/src/assets/emojis/meme_11.png', description: '밈 이모지 설명' },
    { name: '밈12', imageUrl: '/src/assets/emojis/meme_12.png', description: '밈 이모지 설명' },
  ],
}

export default function FreeMode() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('동물')
  const [selectedEmoji, setSelectedEmoji] = useState({ ...EMOJI_IMAGES['동물'][0], category: '동물' })
  const [clickedIdx, setClickedIdx] = useState(null)
  const audioRef = useRef(null)

  const handleEmojiClick = (emoji, idx) => {
    setClickedIdx(idx)
    setSelectedEmoji({ ...emoji, category: selectedCategory })
    setTimeout(() => setClickedIdx(null), 160)
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSelectedEmoji({ ...EMOJI_IMAGES[cat][0], category: cat })
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
        <source src="/src/assets/Neon-grid-crop.mp4" type="video/mp4" />
      </video>

      <img
        src="/src/assets/sound.png"
        alt="sound"
        style={s.soundIcon}
        onError={(e) => { e.target.style.display = 'none' }}
      />

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

          {/* ── 왼쪽 ── */}
          <div style={s.left}>
            <p style={s.secLabel}>CATEGORY</p>
            <div style={s.catRow}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
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
              {EMOJI_IMAGES[selectedCategory].map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji, i)}
                  style={{
                    ...s.cell,
                    transform: clickedIdx === i ? 'scale(0.88) translateY(4px)' : 'scale(1)',
                    boxShadow: clickedIdx === i
                      ? `2px 2px 0px ${NEON}`
                      : `6px 6px 0px ${NEON}`,
                  }}
                >
                  {emoji.emoji ? (
                    <img
                      src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${
                        [...emoji.emoji]
                          .filter(c => c.codePointAt(0) !== 0xfe0f)
                          .map(c => c.codePointAt(0).toString(16))
                          .join('-')
                      }.svg`}
                      alt={emoji.name}
                      style={s.emojiImg}
                    />
                  ) : (
                    emoji.imageUrl && <img src={emoji.imageUrl} alt={emoji.name} style={s.emojiImg} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── 오른쪽 ── */}
          <div style={s.right}>

            <div style={s.panel}>
              <p style={s.panelLabel}>NOW PLAYING</p>
              {selectedEmoji ? (
                <div style={s.nowRow}>
                  <div style={s.nowImgBox}>
                    {selectedEmoji.emoji ? (
                      <img
                        src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${
                          [...selectedEmoji.emoji]
                            .filter(c => c.codePointAt(0) !== 0xfe0f)
                            .map(c => c.codePointAt(0).toString(16))
                            .join('-')
                        }.svg`}
                        alt={selectedEmoji.name}
                        style={s.nowImg}
                      />
                    ) : selectedEmoji.imageUrl ? (
                      <img src={selectedEmoji.imageUrl} alt={selectedEmoji.name} style={s.nowImg} />
                    ) : (
                      <div style={s.nowImgEmpty} />
                    )}
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