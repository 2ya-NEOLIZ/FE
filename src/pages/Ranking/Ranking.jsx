import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'

const NEON = '#1DED83'
const YELLOW = '#f5c518'
const BG = '#060e0b'

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
    // TODO: API 연동 후 아래 목업 제거 후 주석 해제
    // ;(async () => {
    //   try {
    //     const res = await api.get('/api/v1/neoliz/ranking/weekly')
    //     setRankings(res.data.rankings ?? [])
    //     setMyRank(res.data.myRank ?? null)
    //   } catch {
    //     setRankings([])
    //     setMyRank(null)
    //   } finally {
    //     setLoading(false)
    //   }
    // })()
    setRankings([
      { rank: 1, nickname: '민규', score: 50000 },
      { rank: 2, nickname: '주희',    score: 39000 },
      { rank: 3, nickname: '주연',   score: 32000 },
      { rank: 4, nickname: '종윤',     score: 30000 },
      { rank: 5, nickname: '윤지',   score: 21000 },
    ])
    setMyRank({ rank: 398, nickname: '지우', score: 90 })
    setLoading(false)
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
  return (
    <div
      style={{
        ...s.card,
        ...(isFirst ? s.cardFirst : s.cardNormal),
        borderColor: isFirst ? YELLOW : NEON,
      }}
    >
      {isMe && <span style={s.meBadge}>me</span>}
      <span style={{ ...s.cardRank, color: isFirst ? YELLOW : NEON }}>
        {data.rank}등
      </span>
      <span style={s.cardNickname}>{data.nickname}</span>
      <span style={s.cardScore}>{data.score?.toLocaleString()}</span>
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
    minHeight: '100vh',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  weekLabel: {
    fontSize: 16,
    letterSpacing: 3,
    margin: '0 0 16px',
  },
  weekNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    margin: '0 2px',
  },
  title: {
    color: NEON,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 3,
    margin: '0 0 48px',
    textShadow: '0 0 20px rgba(29,237,131,0.4)',
  },
  loadingText: {
    color: NEON,
    fontSize: 16,
  },
  podium: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 32,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px solid',
    borderRadius: 16,
    background: 'rgba(5,15,10,0.85)',
    position: 'relative',
  },
  cardFirst: {
    width: 160,
    padding: '24px 20px',
  },
  cardNormal: {
    width: 120,
    padding: '16px 16px',
  },
  meBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardRank: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardNickname: {
    color: NEON,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardScore: {
    color: NEON,
    fontSize: 12,
    opacity: 0.8,
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    maxWidth: 480,
  },
  myRowWrap: {
    width: '100%',
    maxWidth: 480,
    marginTop: 16,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: 30,
    padding: '10px 24px',
    background: 'rgba(5,15,10,0.75)',
    gap: 16,
  },
  meTag: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 20,
  },
  rowRank: {
    color: NEON,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 45,
  },
  rowNickname: {
    color: NEON,
    fontSize: 15,
    flex: 1,
  },
  rowScore: {
    color: NEON,
    fontSize: 14,
    opacity: 0.8,
  },
  signInBox: {
    border: `2px solid ${NEON}`,
    borderRadius: 16,
    width: '100%',
    maxWidth: 900,
    background: 'rgba(0,0,0,0.85)',
    overflow: 'hidden',
  },
  signInHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: `1px solid ${NEON}`,
    color: NEON,
    fontSize: 18,
    letterSpacing: 1,
  },
  signInBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 60px',
    gap: 32,
  },
  signInTitle: {
    color: NEON,
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: 2,
    margin: 0,
    textShadow: '-3px -3px 0 #cc0000, 3px -3px 0 #cc0000, -3px 3px 0 #cc0000, 3px 3px 0 #cc0000',
  },
  signInLink: {
    color: NEON,
    fontSize: 28,
    textDecoration: 'underline',
    cursor: 'pointer',
    letterSpacing: 1,
  },
}
