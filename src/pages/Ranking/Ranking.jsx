import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'

const NEON = '#1DED83'
const BG = '#060e0b'

const RANK_THEME = {
  1: {
    crown: '👑',
    color: '#FFD700',
    glow: '0 0 32px rgba(255,215,0,0.8), 0 0 64px rgba(255,215,0,0.4)',
    border: '2px solid #FFD700',
    bgGradient: 'linear-gradient(160deg, rgba(255,215,0,0.2) 0%, rgba(5,15,10,0.95) 65%)',
  },
  2: {
    crown: '🥈',
    color: '#C0C0C0',
    glow: '0 0 24px rgba(192,192,192,0.7), 0 0 48px rgba(192,192,192,0.3)',
    border: '2px solid #C0C0C0',
    bgGradient: 'linear-gradient(160deg, rgba(192,192,192,0.15) 0%, rgba(5,15,10,0.95) 65%)',
  },
  3: {
    crown: '🥉',
    color: '#CD7F32',
    glow: '0 0 24px rgba(205,127,50,0.7), 0 0 48px rgba(205,127,50,0.3)',
    border: '2px solid #CD7F32',
    bgGradient: 'linear-gradient(160deg, rgba(205,127,50,0.15) 0%, rgba(5,15,10,0.95) 65%)',
  },
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
        setRankings(res.data.rankings ?? [])
        setMyRank(res.data.myRank ?? null)
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
  const showMyRow = myRank && myRank.rank > 5

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
      <video autoPlay loop muted playsInline style={s.video}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>
      <div style={s.overlay} />

      <div style={s.content}>
        {/* 주차 */}
        <p style={s.weekLabel}>
          <span style={{ color: NEON }}>{month} </span>
          <strong style={s.weekNum}>{week}</strong>
          <span style={{ color: NEON }}>week</span>
        </p>

        {/* 타이틀 */}
        <h1 style={s.title}>Trending This Week</h1>

        {loading ? (
          <p style={s.loadingText}>Loading...</p>
        ) : (
          <>
            {/* 포디움: 2등 - 1등 - 3등 */}
            <div style={s.podium}>
              {top3[1] && (
                <RankCard data={top3[1]} myNickname={myNickname} />
              )}
              {top3[0] && (
                <RankCard data={top3[0]} isFirst myNickname={myNickname} />
              )}
              {top3[2] && (
                <RankCard data={top3[2]} myNickname={myNickname} />
              )}
            </div>

            {/* 4~5등 */}
            <div style={s.listWrap}>
              {rest.map((item) => (
                <RankRow key={item.rank} data={item} myNickname={myNickname} />
              ))}
            </div>

            {/* 내 순위 (5위 밖) */}
            {showMyRow && (
              <div style={s.myRowWrap}>
                <RankRow data={myRank} isMe />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RankCard({ data, isFirst = false, myNickname }) {
  const isMe = data.nickname === myNickname
  const theme = RANK_THEME[data.rank]

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 왕관 */}
      <span style={{
        fontSize: isFirst ? 36 : 28,
        lineHeight: 1,
        marginBottom: -8,
        filter: `drop-shadow(0 0 8px ${theme.color})`,
        zIndex: 1,
      }}>
        {theme.crown}
      </span>

      <div
        style={{
          ...s.card,
          ...(isFirst ? s.cardFirst : s.cardNormal),
          border: theme.border,
          background: theme.bgGradient,
          boxShadow: theme.glow,
        }}
      >
        {isMe && <span style={s.meBadge}>me</span>}

        <span style={{
          ...s.cardRank,
          color: theme.color,
          textShadow: `0 0 12px ${theme.color}`,
        }}>
          {data.rank}등
        </span>

        {/* 프로필 사진 */}
        {data.profileImage && (
          <div style={{
            width: isFirst ? 110 : 86,
            height: isFirst ? 110 : 86,
            borderRadius: 14,
            overflow: 'hidden',
            border: `3px solid ${theme.color}`,
            boxShadow: `0 0 14px ${theme.color}, 0 0 28px rgba(0,0,0,0.6)`,
            marginBottom: 10,
          }}>
            <img
              src={data.profileImage}
              alt={data.nickname}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <span style={{
          ...s.cardNickname,
          color: theme.color,
          fontSize: isFirst ? 22 : 17,
        }}>
          {data.nickname}
        </span>

        <span style={{
          ...s.cardScore,
          color: theme.color,
          fontSize: isFirst ? 16 : 13,
          opacity: 0.85,
        }}>
          {data.score?.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function RankRow({ data, isMe = false, myNickname }) {
  const highlight = isMe || data.nickname === myNickname
  return (
    <div
      style={{
        ...s.row,
        borderColor: highlight ? NEON : 'rgba(29,237,131,0.35)',
      }}
    >
      {highlight && <span style={s.meTag}>me</span>}
      <span style={s.rowRank}>{data.rank}등</span>
      <span style={s.rowNickname}>{data.nickname}</span>
      <span style={s.rowScore}>{data.score?.toLocaleString()}</span>
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
    height: '100vh',
    padding: '20px 20px',
    boxSizing: 'border-box',
    gap: 0,
  },

  weekLabel: {
    fontSize: 20,
    letterSpacing: 6,
    margin: '0 0 6px',
  },
  weekNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    margin: '0 6px',
  },

  title: {
    color: NEON,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 4,
    margin: '0 0 24px',
    textShadow: '0 0 24px rgba(29,237,131,0.5)',
  },
  loadingText: {
    color: NEON,
    fontSize: 22,
  },

  podium: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 20,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  cardFirst: {
    width: 180,
    padding: '20px 20px',
  },
  cardNormal: {
    width: 140,
    padding: '16px 16px',
  },
  meBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    color: '#ff4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardRank: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardNickname: {
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardScore: {
    letterSpacing: 1,
  },

  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    maxWidth: 560,
  },
  myRowWrap: {
    width: '100%',
    maxWidth: 560,
    marginTop: 12,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid',
    borderRadius: 36,
    padding: '12px 28px',
    background: 'rgba(5,15,10,0.75)',
    gap: 16,
  },
  meTag: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 24,
  },
  rowRank: {
    color: NEON,
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 52,
  },
  rowNickname: {
    color: NEON,
    fontSize: 18,
    flex: 1,
  },
  rowScore: {
    color: NEON,
    fontSize: 17,
    opacity: 0.8,
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
