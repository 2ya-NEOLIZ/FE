import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Modal from '../../components/Modal/Modal'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'
import dellFillIcon from '../../assets/Dell_fill.png'
import api from '../../api/index'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'

const PAGE_SIZE = 4
// compressImage 함수 추가 (MyPage 컴포넌트 밖에 선언)
  const compressImage = (file, maxSize, quality) => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = h * maxSize / w; w = maxSize }
          else { w = w * maxSize / h; h = maxSize }
        }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        canvas.toBlob(resolve, 'image/jpeg', quality)
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

export default function MyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sequences, setSequences] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedSeq, setSelectedSeq] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [nickname, setNickname] = useState('닉네임')
  const [editingNick, setEditingNick] = useState(false)
  const [nickInput, setNickInput] = useState('')
  const [nickError, setNickError] = useState('')
  const [playingIdx, setPlayingIdx] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const playTimerRef = useRef(null)
  const fileInputRef = useRef(null)

  const currentItems = sequences

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await api.get('/api/v1/neoliz/users/me')
      if (data.data) {
        setUserInfo(data.data)
        setNickname(data.data?.nickname ?? '닉네임')
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchSequences = async () => {
      const { data } = await api.get(`/api/v1/neoliz/users/me/sequences?page=${page - 1}&size=${PAGE_SIZE}`)
      if (data.data) {
        setSequences(
          data.data.sequences.map(s => ({
            ...s,
            date: s.createdAt?.slice(0, 10).replace(/-/g, '.'),
          }))
        )
        setTotalPages(data.data.totalPages || 1)
      }
    }
    fetchSequences()
  }, [page, location.key, refreshKey])

  const handlePlaySeq = async (seq) => {
    if (isPlaying) {
      clearTimeout(playTimerRef.current)
      setPlayingIdx(null)
      setIsPlaying(false)
      return
    }
    try {
      const { data } = await api.get(`/api/v1/neoliz/users/me/sequences/${seq.id}`)
      const items = data.data.items
      setIsPlaying(true)
      let step = 0
      const next = () => {
        if (step >= items.length) {
          setPlayingIdx(null)
          setIsPlaying(false)
          return
        }
        setPlayingIdx(step)
        if (items[step].soundUrl) {
          const audio = new Audio(items[step].soundUrl)
          audio.play().catch(() => {})
        }
        const interval = 800 * (items[step].multiplier ?? 1)
        playTimerRef.current = setTimeout(() => { step++; next() }, interval)
      }
      next()
    } catch {
      setIsPlaying(false)
    }
  }

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressImage(file, 800, 0.8)
    const formData = new FormData()
    formData.append('profileImage', compressed)
    try {
      const { data } = await api.patch('/api/v1/neoliz/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data.data?.profileImageUrl) {
        setUserInfo(prev => ({ ...prev, profileImageUrl: data.data.profileImageUrl }))
      }
    } catch {
      console.error('프로필 이미지 업로드 실패')
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/api/v1/neoliz/users/me/sequences/${id}`)
    setSelectedSeq(null)
    setDeleteTarget(null)
    if (sequences.length === 1 && page > 1) {
      setPage(p => p - 1)
    } else {
      setRefreshKey(k => k + 1)
    }
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
        .seq-row:hover { border-color: #1DED83 !important; z-index: 1; position: relative; }

        @media (max-width: 768px) {
          .mypage-title { font-size: 48px !important; top: 24px !important; }
          .mypage-content {
            flex-direction: column !important;
            padding: 100px 16px 40px !important;
            gap: 24px !important;
            align-items: center !important;
          }
          .mypage-profile {
            padding: 24px 32px !important;
            width: 100% !important;
            max-width: 480px !important;
          }
          .mypage-profile-img {
            width: 120px !important;
            height: 120px !important;
          }
          .mypage-nickname-btn {
            font-size: 20px !important;
            padding: 14px 0 !important;
          }
          .mypage-email {
            font-size: 14px !important;
          }
          .mypage-studio {
            width: 100% !important;
            max-width: 480px !important;
            padding-top: 0 !important;
          }
          .mypage-studio-title {
            font-size: 18px !important;
            padding: 14px 16px !important;
          }
          .seq-row {
            padding: 18px 16px !important;
          }
          .seq-title {
            font-size: 18px !important;
          }
          .seq-date {
            font-size: 13px !important;
          }
          .detail-modal {
            min-width: unset !important;
            width: 90vw !important;
            padding: 32px 24px !important;
          }
        }

        @media (max-width: 400px) {
          .mypage-title { font-size: 36px !important; }
          .mypage-profile-img {
            width: 96px !important;
            height: 96px !important;
          }
        }
      `}</style>

      <video autoPlay loop muted style={s.bgVideo}>
        <source src={neonGridVideo} type="video/mp4" />
      </video>

      {/* 시퀀스 상세 모달 */}
      {selectedSeq && (
        <div style={s.overlay} onClick={() => { setSelectedSeq(null); setIsPlaying(false); clearTimeout(playTimerRef.current); setPlayingIdx(null) }}>
          <div className="detail-modal" style={s.detailModal} onClick={e => e.stopPropagation()}>
            <div style={s.detailTitle}>{selectedSeq.title}</div>
            <div style={s.detailDate}>{selectedSeq.date}</div>
            <div style={s.detailBtns}>
              <button style={s.detailBtn} onClick={() => handlePlaySeq(selectedSeq)}>
                {isPlaying ? '⏹ 정지' : '▶ 재생'}
              </button>
              <button
                style={{ ...s.detailBtn, borderColor: '#ff4444', color: '#ff4444' }}
                onClick={() => setDeleteTarget(selectedSeq)}
              >
                삭제
              </button>
            </div>
            <button style={s.closeBtn} onClick={() => { setSelectedSeq(null); setIsPlaying(false); clearTimeout(playTimerRef.current); setPlayingIdx(null) }}>✕</button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        message={`"${deleteTarget?.title}"\n정말 삭제하시겠습니까?`}
        confirmText="삭제"
        onConfirm={() => handleDelete(deleteTarget.id)}
        cancelText="취소"
        onCancel={() => setDeleteTarget(null)}
        borderColor="#ff4444"
      />

      <h1 className="mypage-title" style={s.title}>My Page</h1>

      <div className="mypage-content" style={s.content}>
        {/* 프로필 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="mypage-profile" style={s.profile}>
            <div className="mypage-profile-img-wrap" style={s.profileImgWrap}>
              <div className="mypage-profile-img" style={s.profileImg}>
                {userInfo?.profileImageUrl
                  ? <img src={userInfo.profileImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                  : <span style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>👤</span>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageChange} />
              <button style={{ ...s.editImgBtn, cursor: 'pointer', opacity: 1 }} onClick={() => fileInputRef.current.click()} title="프로필 이미지 변경">✎</button>
            </div>
            <span className="mypage-email" style={s.email}>{userInfo?.email}</span>
            {editingNick ? (
              <input
                className="mypage-nickname-btn"
                style={{ ...s.nicknamebtn, textAlign: 'center', outline: 'none', boxSizing: 'border-box', width: '100%', display: 'block' }}
                size={1}
                value={nickInput}
                onChange={e => setNickInput(e.target.value)}
                onBlur={async () => {
                  const trimmed = nickInput.trim()
                  if (trimmed.length < 2 || trimmed.length > 10) {
                    setNickError('2~10자로 입력해주세요.')
                    return
                  }
                  if (/[^a-zA-Z0-9가-힣]/.test(trimmed)) {
                    setNickError('특수문자는 사용할 수 없습니다.')
                    return
                  }
                  const { data } = await api.patch('/api/v1/neoliz/users/me/nickname', { nickname: trimmed })
                  setNickError('')
                  setNickname(data.data?.nickname ?? trimmed)
                  setEditingNick(false)
                }}
                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                maxLength={10}
                autoFocus
              />
            ) : (
              <button className="mypage-nickname-btn" style={s.nicknamebtn} onClick={() => { setNickInput(nickname); setEditingNick(true) }}>{nickname}</button>
            )}
            {nickError && (
              <span style={{ color: '#ff4444', fontSize: 11, fontFamily: FONT, textAlign: 'center' }}>
                {nickError}
              </span>
            )}
          </div>
          <div style={s.profileBar} />
        </div>

        {/* 시퀀스 목록 */}
        <div className="mypage-studio" style={s.studio}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '10%' }}>
            <div className="mypage-studio-title" style={s.studioTitle}>MY EMOJI STUDIO</div>
            {sequences.length === 0 ? (
              <div style={{ ...s.empty, justifyContent: 'center' }}>
                <span style={{ color: NEON_TEXT, fontSize: 'clamp(13px, 1.4vw, 16px)' }}>아직 저장한 시퀀스가 없어요.</span>
                <button style={s.createBtn} onClick={() => navigate('/emoji-jam/sequence')}>시퀀스 생성하기 &gt;</button>
              </div>
            ) : (
              <>
                {currentItems.map((seq, i) => (
                  <div
                    key={seq.id}
                    style={{ ...s.seqRow, borderRadius: i === currentItems.length - 1 ? '0 0 8px 8px' : 0 }}
                    className="seq-row"
                    onClick={() => { setSelectedSeq(seq); setIsPlaying(false) }}
                  >
                    <div
                      style={s.seqNumBox}
                      onMouseEnter={() => setHoveredId(seq.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={e => { e.stopPropagation(); setDeleteTarget(seq) }}
                    >
                      {hoveredId === seq.id
                        ? <img src={dellFillIcon} style={{ width: 16, height: 16 }} />
                        : <span style={s.seqNum}>{(page - 1) * PAGE_SIZE + i + 1}</span>
                      }
                    </div>
                    <span className="seq-title" style={s.seqTitle}>{seq.title}</span>
                    <span className="seq-date" style={s.seqDate}>{seq.date}</span>
                  </div>
                ))}
                <div style={s.pagination}>
                  <button style={{ ...s.pageBtn, opacity: page === 1 ? 0.3 : 1 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>◀</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} style={{ ...s.pageBtn, color: page === i + 1 ? NEON : `${NEON_TEXT}99` }} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button style={{ ...s.pageBtn, opacity: page === totalPages ? 0.3 : 1 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>▶</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap:         { display: 'flex', flexDirection: 'column', background: '#060e0b', fontFamily: FONT, color: NEON, position: 'relative', minHeight: '100vh', overflow: 'visible' },
  bgVideo:      { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.7 },
  title:        { position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)', fontSize: 80, color: NEON, fontFamily: FONT, zIndex: 2, letterSpacing: 4, margin: 0, whiteSpace: 'nowrap' },
  content:      { position: 'relative', marginTop: 32, zIndex: 1, display: 'flex', flexDirection: 'row', overflow: 'visible', alignItems: 'flex-start', justifyContent: 'center', flex: 1, gap: 60, padding: '180px 4% 40px', flexWrap: 'wrap' },
  profile:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.5)', border: `1px solid #1a3a2e`, borderRadius: '20px 20px 0 0', padding: '40px 60px' },
  profileImg:   { width: 320, height: 320, borderRadius: 16, border: `3px solid ${NEON}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E0E17', overflow: 'hidden' },
  editImgBtn:   { position: 'absolute', bottom: 8, right: 8, background: '#0E0E17', border: `2px solid ${NEON}`, borderRadius: '50%', width: 32, height: 32, color: NEON, fontSize: 16, opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileImgWrap: { position: 'relative' },
  email:        { color: NEON_TEXT, fontSize: 22, fontFamily: FONT, wordBreak: 'break-all', textAlign: 'center' },
  profileBar:   { height: 8, background: NEON, borderRadius: '0 0 20px 20px' },
  nicknamebtn:  { width: '100%', padding: '22px 0', background: '#0E0E17', border: `2px solid ${NEON}`, borderRadius: 12, color: NEON_TEXT, fontFamily: FONT, fontSize: 32, cursor: 'pointer' },
  studio:       { display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', maxWidth: 900, marginTop: 0, alignSelf: 'stretch', paddingTop: 0 },
  studioTitle:  { fontSize: 26, color: NEON_TEXT, padding: '18px 24px', letterSpacing: 2, border: `1px solid #1a3a2e`, borderRadius: '8px 8px 0 0', background: 'rgba(17,17,17,0.8)' },
  seqRow:       { display: 'flex', alignItems: 'center', gap: 16, padding: '28px 24px', border: `1px solid #1a3a2e`, background: 'rgba(0,0,0,0.5)', cursor: 'pointer', borderRadius: 0 },
  seqNum:       { color: NEON_TEXT, fontSize: 22, width: 24, textAlign: 'center' },
  seqNumBox:    { width: 32, height: 32, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  seqTitle:     { color: NEON_TEXT, fontSize: 26, flex: 1 },
  seqDate:      { color: NEON_TEXT, fontSize: 20, opacity: 0.5, flexShrink: 0 },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 },
  pageBtn:      { background: 'transparent', border: 'none', color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', fontSize: 24 },
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '60px 24px', background: 'rgba(0,0,0,0.3)', border: `1px solid #1a3a2e`, paddingTop: '15%' },
  createBtn:    { padding: '10px 32px', background: '#0E0E17', border: `2px solid ${NEON}`, borderRadius: 12, color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', fontSize: 16 },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  detailModal:  { background: '#0a1a0f', border: `2px solid ${NEON}`, borderRadius: 20, padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minWidth: 360, position: 'relative', boxShadow: '0 0 30px rgba(0,255,128,0.2)' },
  detailTitle:  { color: NEON, fontFamily: FONT, fontSize: 20, textAlign: 'center' },
  detailDate:   { color: NEON_TEXT, fontFamily: FONT, fontSize: 14, opacity: 0.6 },
  detailBtns:   { display: 'flex', gap: 16, marginTop: 8 },
  detailBtn:    { padding: '10px 32px', background: 'transparent', border: `2px solid ${NEON}`, borderRadius: 10, color: NEON, fontFamily: FONT, fontSize: 16, cursor: 'pointer' },
  closeBtn:     { position: 'absolute', top: 12, right: 16, background: 'transparent', border: 'none', color: NEON, fontSize: 20, cursor: 'pointer' },
}