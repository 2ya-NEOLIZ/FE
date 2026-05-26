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

  //if 문 로그인 연동 후 지우기
  if (import.meta.env.DEV && !localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', 'dev-mock-token')
    localStorage.setItem('nickname', '지우')
  }

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
  
  // 1. 주차 표시 크기 업
  weekLabel: {
    fontSize: 20, // 16 -> 20
    letterSpacing: 4,
    margin: '0 0 16px',
  },
  weekNum: {
    color: '#fff',
    fontSize: 26, // 20 -> 26
    fontWeight: 'bold',
    margin: '0 4px',
  },
  
  // 2. 메인 타이틀 크기 업
  title: {
    color: NEON,
    fontSize: 54, // 42 -> 54
    fontWeight: 'bold',
    letterSpacing: 4,
    margin: '0 0 56px',
    textShadow: '0 0 24px rgba(29,237,131,0.5)',
  },
  loadingText: {
    color: NEON,
    fontSize: 20,
  },
  
  // 3. 포디움(1~3등) 카드 크기 업
  podium: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 28, // 20 -> 28
    marginBottom: 40,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px solid',
    borderRadius: 20, // 16 -> 20
    background: 'rgba(5,15,10,0.85)',
    position: 'relative',
  },
  cardFirst: {
    width: 200, // 160 -> 200
    padding: '30px 24px',
  },
  cardNormal: {
    width: 150, // 120 -> 150
    padding: '20px 20px',
  },
  meBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    color: '#ff4444',
    fontSize: 14, // 12 -> 14
    fontWeight: 'bold',
  },
  cardRank: {
    fontSize: 36, // 28 -> 36
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardNickname: {
    color: NEON,
    fontSize: 18, // 13 -> 18
    marginBottom: 6,
    textAlign: 'center',
  },
  cardScore: {
    color: NEON,
    fontSize: 16, // 12 -> 16
    opacity: 0.8,
  },
  
  // 4. 리스트(4~5등 및 내 순위) 크기 업
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14, // 10 -> 14
    width: '100%',
    maxWidth: 600, // 480 -> 600
  },
  myRowWrap: {
    width: '100%',
    maxWidth: 600, // 480 -> 600
    marginTop: 20,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid', // 1px -> 2px (조금 더 선명하게)
    borderRadius: 36,
    padding: '16px 32px', // 10px 24px -> 16px 32px
    background: 'rgba(5,15,10,0.75)',
    gap: 20,
  },
  meTag: {
    color: '#ff4444',
    fontSize: 16, // 12 -> 16
    fontWeight: 'bold',
    minWidth: 28,
  },
  rowRank: {
    color: NEON,
    fontSize: 22, // 16 -> 22
    fontWeight: 'bold',
    minWidth: 60,
  },
  rowNickname: {
    color: NEON,
    fontSize: 20, // 15 -> 20
    flex: 1,
  },
  rowScore: {
    color: NEON,
    fontSize: 18, // 14 -> 18
    opacity: 0.8,
  },
  
  // 로그인 화면 크기도 비율에 맞춰 업
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
    fontSize: 72, // 56 -> 72
    fontWeight: 'bold',
    letterSpacing: 3,
    margin: 0,
    textShadow: '-4px -4px 0 #cc0000, 4px -4px 0 #cc0000, -4px 4px 0 #cc0000, 4px 4px 0 #cc0000',
  },
  signInLink: {
    color: NEON,
    fontSize: 36, // 28 -> 36
    textDecoration: 'underline',
    cursor: 'pointer',
    letterSpacing: 2,
  },
}
