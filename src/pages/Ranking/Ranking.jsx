import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'

const NEON = '#1DED83'
const ME_COLOR = '#AFFFDA'
const ME_GLOW  = 'rgba(175,255,218,0.55)'
const BG = '#060e0b'

const RANK_THEME = {
  1: {
    crown: '👑',
    color: '#FFD700',
    glow: '0 0 32px rgba(255,215,0,0.8), 0 0 64px rgba(255,215,0,0.4)',
    border: '2px solid #FFD700',
    bgGradient: 'linear-gradient(160deg, rgba(255,215,0,0.2) 0%, rgba(5,15,10,0.95) 65%)',
    podiumHeight: 100,
    podiumColor: 'rgba(255,215,0,0.25)',
    podiumBorder: 'rgba(255,215,0,0.6)',
  },
  2: {
    crown: '🥈',
    color: '#C0C0C0',
    glow: '0 0 24px rgba(192,192,192,0.7), 0 0 48px rgba(192,192,192,0.3)',
    border: '2px solid #C0C0C0',
    bgGradient: 'linear-gradient(160deg, rgba(192,192,192,0.15) 0%, rgba(5,15,10,0.95) 65%)',
    podiumHeight: 66,
    podiumColor: 'rgba(192,192,192,0.18)',
    podiumBorder: 'rgba(192,192,192,0.5)',
  },
  3: {
    crown: '🥉',
    color: '#CD7F32',
    glow: '0 0 24px rgba(205,127,50,0.7), 0 0 48px rgba(205,127,50,0.3)',
    border: '2px solid #CD7F32',
    bgGradient: 'linear-gradient(160deg, rgba(205,127,50,0.15) 0%, rgba(5,15,10,0.95) 65%)',
    podiumHeight: 44,
    podiumColor: 'rgba(205,127,50,0.18)',
    podiumBorder: 'rgba(205,127,50,0.5)',
  },
}

const rankingCss = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUpPodium {
    from { opacity: 0; transform: translateY(36px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes mePulse {
    0%, 100% { box-shadow: 0 0 14px ${ME_GLOW}, inset 0 0 20px rgba(175,255,218,0.04); }
    50%       { box-shadow: 0 0 28px ${ME_GLOW}, inset 0 0 30px rgba(175,255,218,0.09); }
  }
  @keyframes scanline {
    0%   { top: -8px; }
    100% { top: 100%; }
  }
`

function PixelAvatar({ size = 86, color = NEON }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="16" height="16" fill="#060e0b" />
      <rect x="5" y="1" width="6" height="5" fill={color} opacity="0.9" />
      <rect x="6" y="2" width="1" height="1" fill="#060e0b" />
      <rect x="9" y="2" width="1" height="1" fill="#060e0b" />
      <rect x="6" y="4" width="4" height="1" fill="#060e0b" />
      <rect x="6" y="4" width="1" height="1" fill={color} opacity="0.5" />
      <rect x="9" y="4" width="1" height="1" fill={color} opacity="0.5" />
      <rect x="7" y="6" width="2" height="1" fill={color} opacity="0.7" />
      <rect x="4" y="7" width="8" height="5" fill={color} opacity="0.75" />
      <rect x="2" y="7" width="2" height="4" fill={color} opacity="0.6" />
      <rect x="12" y="7" width="2" height="4" fill={color} opacity="0.6" />
      <rect x="4" y="12" width="3" height="3" fill={color} opacity="0.65" />
      <rect x="9" y="12" width="3" height="3" fill={color} opacity="0.65" />
      <rect x="5" y="1" width="1" height="1" fill="#ffffff" opacity="0.3" />
    </svg>
  )
}

function getWeekLabel() {
  const now = new Date()
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ]
  return {
    month: months[now.getMonth()],
    week: Math.ceil(now.getDate() / 7),
  }
}

export default function Ranking() {
  const [rankings, setRankings] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const { month, week } = getWeekLabel()
  const myNickname = localStorage.getItem('nickname')
  const isLoggedIn = !!localStorage.getItem('accessToken')
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/api/v1/neoliz/ranking/weekly')
        setRankings(res.data.data.top5 ?? [])
        setMyRank(res.data.data.me ?? null)
      } catch {
        setRankings([])
        setMyRank(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const top3 = rankings.slice(0, 3)
  const rest  = rankings.slice(3, 5)
  const showMyRow = myRank && !rankings.some(r => r.isMe)

  if (!isLoggedIn) {
    return (
      <div style={s.root}>
        <video autoPlay loop muted playsInline style={s.video}>
          <source src={neonGridVideo} type="video/mp4" />
        </video>
        <div style={s.overlay} />
        <div style={s.content}>
          <div style={s.signInBox}>
            <div style={s.signInHeader}>
              <span>PLAYER 1</span>
              <span>SCORE 000000 NAME ???</span>
            </div>
            <div style={s.signInBody}>
              <p style={s.signInTitle}>Sign in to Rank Up</p>
              <span style={s.signInLink} onClick={() => navigate('/login')}>
                Login
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <style>{rankingCss}</style>
      <video autoPlay loop muted playsInline style={s.video}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>
      <div style={s.overlay} />

      <div style={s.content}>
        <p style={s.weekLabel}>
          <span style={{ color: NEON }}>{month} </span>
          <strong style={s.weekNum}>{week}</strong>
          <span style={{ color: NEON }}>week</span>
        </p>

        <h1 style={s.title}>Trending This Week</h1>

        {loading ? (
          <p style={s.loadingText}>Loading...</p>
        ) : (
          <>
            <div style={s.podiumWrap}>
              <div style={s.podiumSlot}>
                {top3[1] && <RankCard data={top3[1]} myNickname={myNickname} animDelay={0.2} />}
                {top3[1] && <PodiumBase rank={2} />}
              </div>
              <div style={{ ...s.podiumSlot, transform: 'translateY(-36px)' }}>
                {top3[0] && <RankCard data={top3[0]} isFirst myNickname={myNickname} animDelay={0.1} />}
                {top3[0] && <PodiumBase rank={1} />}
              </div>
              <div style={{ ...s.podiumSlot, transform: 'translateY(16px)' }}>
                {top3[2] && <RankCard data={top3[2]} myNickname={myNickname} animDelay={0.3} />}
                {top3[2] && <PodiumBase rank={3} />}
              </div>
            </div>

            <div style={s.listWrap}>
              {rest.map((item, idx) => (
                <RankRow key={item.rank} data={item} myNickname={myNickname} index={idx} />
              ))}
            </div>

            {showMyRow && (
              <div style={s.myRowWrap}>
                <RankRow data={myRank} isMe index={0} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PodiumBase({ rank }) {
  const theme = RANK_THEME[rank]
  return (
    <div style={{
      width: rank === 1 ? 196 : 148,
      height: theme.podiumHeight,
      background: theme.podiumColor,
      border: `2px solid ${theme.podiumBorder}`,
      borderBottom: 'none',
      borderRadius: '8px 8px 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 -4px 20px ${theme.podiumBorder}`,
      backdropFilter: 'blur(4px)',
    }}>
      <span style={{
        color: theme.color,
        fontSize: rank === 1 ? 34 : 26,
        fontWeight: 'bold',
        fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
        textShadow: `0 0 10px ${theme.color}`,
        opacity: 0.7,
      }}>
        {rank}
      </span>
    </div>
  )
}

function RankCard({ data, isFirst = false, myNickname, animDelay = 0 }) {
  const isMe = data.isMe || data.nickname === myNickname
  const theme = RANK_THEME[data.rank]
  const imgSize = isFirst ? 124 : 96
  const cardColor = isMe ? ME_COLOR : theme.color

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: `fadeUpPodium 0.55s cubic-bezier(.22,.68,0,1.2) ${animDelay}s both`,
    }}>
      <span style={{
        fontSize: isFirst ? 64 : 50,
        lineHeight: 1,
        marginBottom: 4,
        filter: `drop-shadow(0 0 8px ${theme.color})`,
      }}>
        {theme.crown}
      </span>

      <div style={{
        ...s.card,
        ...(isFirst ? s.cardFirst : s.cardNormal),
        border: isMe ? `2px solid ${ME_COLOR}` : theme.border,
        background: isMe
          ? 'linear-gradient(160deg, rgba(175,255,218,0.13) 0%, rgba(5,15,10,0.95) 65%)'
          : theme.bgGradient,
        boxShadow: isMe
          ? `0 0 24px ${ME_GLOW}, 0 0 48px rgba(175,255,218,0.2)`
          : theme.glow,
        animation: isMe ? 'mePulse 2.8s ease-in-out infinite' : 'none',
      }}>

        {/* me 배지 */}
        {isMe && (
          <span style={s.meBadge}>ME</span>
        )}

        {/* 스캔라인 (me 전용) */}
        {isMe && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            overflow: 'hidden', pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 8,
              background: 'linear-gradient(to bottom, transparent, rgba(175,255,218,0.06), transparent)',
              animation: 'scanline 3s linear infinite',
            }} />
          </div>
        )}

        <div style={{
          width: imgSize,
          height: imgSize,
          borderRadius: 12,
          overflow: 'hidden',
          border: `3px solid ${cardColor}`,
          boxShadow: `0 0 14px ${cardColor}, 0 0 28px rgba(0,0,0,0.6)`,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060e0b',
        }}>
          {data.profileImageUrl ? (
            <img
              src={data.profileImageUrl}
              alt={data.nickname}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <PixelAvatar size={imgSize} color={cardColor} />
          )}
        </div>

        <span style={{
          ...s.cardNickname,
          color: cardColor,
          fontSize: isFirst ? 24 : 18,
        }}>
          {data.nickname}
        </span>

        <span style={{
          ...s.cardScore,
          color: cardColor,
          fontSize: isFirst ? 17 : 14,
          opacity: 0.85,
        }}>
          ▲ {Number(data.totalScore ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function RankRow({ data, isMe = false, myNickname, index = 0 }) {
  const highlight = isMe || data.isMe || data.nickname === myNickname
  const rankColor = highlight ? ME_COLOR : NEON

  return (
    <div style={{
      ...s.row,
      borderColor: highlight ? `${ME_COLOR}AA` : 'rgba(29,237,131,0.4)',
      boxShadow: highlight
        ? `0 0 20px rgba(175,255,218,0.2), inset 0 0 24px rgba(175,255,218,0.04)`
        : '0 0 10px rgba(29,237,131,0.1)',
      background: highlight
        ? 'rgba(175,255,218,0.06)'
        : 'rgba(5,15,10,0.80)',
      animation: highlight
        ? `fadeUp 0.45s cubic-bezier(.22,.68,0,1.15) ${0.3 + index * 0.1}s both, mePulse 3s ease-in-out infinite`
        : `fadeUp 0.45s cubic-bezier(.22,.68,0,1.15) ${0.3 + index * 0.1}s both`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 72,
      }}>
        <div style={{
          width: 4,
          height: 34,
          borderRadius: 2,
          background: rankColor,
          boxShadow: `0 0 8px ${rankColor}`,
          opacity: 0.85,
        }} />
        <span style={{
          color: rankColor,
          fontSize: 24,
          fontWeight: 'bold',
          textShadow: `0 0 8px ${rankColor}`,
          fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
        }}>
          {data.rank}
        </span>
      </div>

      <div style={{
        width: 46,
        height: 46,
        borderRadius: 8,
        overflow: 'hidden',
        border: `2px solid ${rankColor}`,
        boxShadow: `0 0 8px ${rankColor}50`,
        background: '#060e0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {data.profileImageUrl ? (
          <img src={data.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <PixelAvatar size={46} color={rankColor} />
        )}
      </div>

      {highlight && <span style={s.meTag}>ME</span>}

      <span style={{
        color: rankColor,
        fontSize: 20,
        flex: 1,
        fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
        letterSpacing: 1,
      }}>
        {data.nickname}
      </span>

      <span style={{
        color: rankColor,
        fontSize: 19,
        opacity: 0.85,
        fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
        letterSpacing: 1,
      }}>
        ▲ {Number(data.totalScore ?? 0).toLocaleString()}
      </span>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: BG,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  video: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '55%',
    objectFit: 'cover',
    objectPosition: 'bottom',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'linear-gradient(to bottom, #060e0b 35%, transparent 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '80px 20px 48px',
    boxSizing: 'border-box',
    gap: 0,
  },
  weekLabel: {
    fontSize: 22,
    letterSpacing: 6,
    margin: '0 0 8px',
    marginTop: '-48px',
  },
  weekNum: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    margin: '0 6px',
  },
  title: {
    color: NEON,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
    margin: '0 0 56px',
    textShadow: '0 0 24px rgba(29,237,131,0.5)',
  },
  loadingText: {
    color: NEON,
    fontSize: 22,
  },
  podiumWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 32,
  },
  podiumSlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
    padding: '18px 18px 14px',
  },
  cardFirst: {
    width: 210,
  },
  cardNormal: {
    width: 162,
  },
  // me 배지 — 오른쪽 상단, 캡슐 스타일
  meBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    color: ME_COLOR,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    background: 'rgba(175,255,218,0.12)',
    border: `1px solid rgba(175,255,218,0.4)`,
    borderRadius: 6,
    padding: '2px 7px',
    textShadow: `0 0 8px ${ME_COLOR}`,
  },
  cardNickname: {
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardScore: {
    letterSpacing: 1,
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 660,
  },
  myRowWrap: {
    width: '100%',
    maxWidth: 660,
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px dashed rgba(175,255,218,0.2)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid',
    borderRadius: 22,
    padding: '14px 26px',
    gap: 16,
    transition: 'box-shadow 0.2s',
  },
  // me 태그 — 캡슐 스타일
  meTag: {
    color: ME_COLOR,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    background: 'rgba(175,255,218,0.1)',
    border: `1px solid rgba(175,255,218,0.35)`,
    borderRadius: 5,
    padding: '2px 6px',
    textShadow: `0 0 6px ${ME_COLOR}`,
    flexShrink: 0,
  },
  signInBox: {
    border: `2px solid ${NEON}`,
    borderRadius: 20,
    width: '100%',
    maxWidth: 1000,
    background: 'rgba(0,0,0,0.85)',
    overflow: 'hidden',
  },
  signInHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 40px',
    borderBottom: `1px solid ${NEON}`,
    color: NEON,
    fontSize: 22,
    letterSpacing: 2,
  },
  signInBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '140px 80px',
    gap: 40,
  },
  signInTitle: {
    color: NEON,
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 3,
    margin: 0,
    textShadow: '-4px -4px 0 #cc0000, 4px -4px 0 #cc0000, -4px 4px 0 #cc0000, 4px 4px 0 #cc0000',
  },
  signInLink: {
    color: NEON,
    fontSize: 36,
    textDecoration: 'underline',
    cursor: 'pointer',
    letterSpacing: 2,
  },
}