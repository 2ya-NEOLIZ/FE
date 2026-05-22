import { useState } from 'react'
import Modal from '../../components/Modal/Modal'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'

const MOCK_USER = {
  email: 'mypage@hufs.ac.kr',
  profileImage: null,
}

const MOCK_SEQUENCES = [
  { id: 1, title: '시퀀스 목록 내 예시 1', date: '2026.05.15' },
  { id: 2, title: '시퀀스 목록 내 예시 2', date: '2026.05.15' },
  { id: 3, title: '시퀀스 목록 내 예시 3', date: '2026.05.16' },
  { id: 4, title: '시퀀스 목록 내 예시 4', date: '2026.05.16' },
  { id: 5, title: '시퀀스 목록 내 예시 5', date: '2026.05.17' },
  { id: 6, title: '시퀀스 목록 내 예시 6', date: '2026.05.17' },
]

const PAGE_SIZE = 4

export default function MyPage() {
  const [sequences, setSequences] = useState(MOCK_SEQUENCES)
  const [page, setPage] = useState(1)
  const [selectedSeq, setSelectedSeq] = useState(null)   // 상세 모달용
  const [deleteTarget, setDeleteTarget] = useState(null)  // 삭제 확인 모달용
  const [isPlaying, setIsPlaying] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [nickname, setNickname] = useState('닉네임')
  const [editingNick, setEditingNick] = useState(false)
  const [nickInput, setNickInput] = useState('')
  const [nickError, setNickError] = useState('')

  const totalPages = Math.ceil(sequences.length / PAGE_SIZE)
  const currentItems = sequences.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = (id) => {
    setSequences(prev => prev.filter(s => s.id !== id))
    setSelectedSeq(null)
    setDeleteTarget(null)
    if (currentItems.length === 1 && page > 1) setPage(p => p - 1)
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        .seq-row:hover { border-color: #1DED83 !important; z-index: 1; position: relative; }
      `}</style>

      <video autoPlay loop muted style={s.bgVideo}>
        <source src="/src/assets/Neon-grid-crop.mp4" type="video/mp4" />
      </video>

      {/* 시퀀스 상세 모달 */}
      {selectedSeq && (
        <div style={s.overlay} onClick={() => { setSelectedSeq(null); setIsPlaying(false) }}>
          <div style={s.detailModal} onClick={e => e.stopPropagation()}>
            <div style={s.detailTitle}>{selectedSeq.title}</div>
            <div style={s.detailDate}>{selectedSeq.date}</div>
            <div style={s.detailBtns}>
              <button style={s.detailBtn} onClick={() => setIsPlaying(v => !v)}>
                {isPlaying ? '⏹ 정지' : '▶ 재생'}
              </button>
              <button
                style={{ ...s.detailBtn, borderColor: '#ff4444', color: '#ff4444' }}
                onClick={() => setDeleteTarget(selectedSeq)}
              >
                삭제
              </button>
            </div>
            <button style={s.closeBtn} onClick={() => { setSelectedSeq(null); setIsPlaying(false) }}>✕</button>
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

      <h1 style={s.title}>My Page</h1>

      <div style={s.content}>
        {/* 프로필 */}
        <div>
        <div style={s.profile}>
          <div style={s.profileImgWrap}>
            <div style={s.profileImg}>
              {MOCK_USER.profileImage
                ? <img src={MOCK_USER.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
                : <span style={{ fontSize: 48 }}>👤</span>
              }
            </div>
            {/* 프로필 이미지 버튼: 현재 비활성화 */}
            <button style={s.editImgBtn} disabled title="준비 중">✎</button>
          </div>
          <span style={s.email}>{MOCK_USER.email}</span>
          {editingNick ? (
            <input
              style={{ ...s.nicknamebtn, textAlign: 'center', outline: 'none', boxSizing: 'border-box', width: '100%', display: 'block' }}
              size={1}
              value={nickInput}
              onChange={e => setNickInput(e.target.value)}
              onBlur={() => {
                const trimmed = nickInput.trim()
                if (trimmed.length < 2 || trimmed.length > 10) {
                  setNickError('2~10자로 입력해주세요.')
                  return
                }
                if (/[^a-zA-Z0-9가-힣]/.test(trimmed)) {
                  setNickError('특수문자는 사용할 수 없습니다.')
                  return
                }
                setNickError('')
                setNickname(trimmed)
                setEditingNick(false)
              }}
              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
              maxLength={10}
              autoFocus
            />
          ) : (
            <button style={s.nicknamebtn} onClick={() => { setNickInput(nickname); setEditingNick(true) }}>{nickname}</button>
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
        <div style={s.studio}>
          <div style={s.studioTitle}>MY EMOJI STUDIO</div>

          {sequences.length === 0 ? (
            <div style={s.empty}>
              <span style={{ color: NEON_TEXT, fontSize: 16 }}>아직 저장한 시퀀스가 없어요.</span>
              <button style={s.createBtn}>시퀀스 생성하기 &gt;</button>
            </div>
          ) : (
            <>
              {currentItems.map((seq, i) => (
                <div key={seq.id} style={s.seqRow} className="seq-row" onClick={() => { setSelectedSeq(seq); setIsPlaying(false) }}>
                  <div
                    style={s.seqNumBox}
                    onMouseEnter={() => setHoveredId(seq.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={e => { e.stopPropagation(); setDeleteTarget(seq) }}
                  >
                    {hoveredId === seq.id
                      ? <img src="/src/assets/Dell_fill.png" style={{ width: 16, height: 16 }} />
                      : <span style={s.seqNum}>{(page - 1) * PAGE_SIZE + i + 1}</span>
                    }
                  </div>
                  <span style={s.seqTitle}>{seq.title}</span>
                  <span style={s.seqDate}>{seq.date}</span>
                </div>
              ))}

              <div style={s.pagination}>
                <button
                  style={{ ...s.pageBtn, opacity: page === 1 ? 0.3 : 1 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >◀</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    style={{ ...s.pageBtn, color: page === i + 1 ? NEON : `${NEON_TEXT}55` }}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  style={{ ...s.pageBtn, opacity: page === totalPages ? 0.3 : 1 }}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >▶</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap:         { display: 'flex', flexDirection: 'column', height: '100vh', background: '#060e0b', fontFamily: FONT, color: NEON, position: 'relative', overflow: 'hidden' },
  bgVideo:      { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.7 },
  title:        { position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)', fontSize: 80, color: NEON, fontFamily: FONT, zIndex: 2, letterSpacing: 4, margin: 0 },
  content:      { position: 'relative', top: 32, zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 80, padding: '80px 80px', transform: 'scale(1.8)' },
  profile:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.5)', border: `1px solid #1a3a2e`, borderRadius: '16px 16px 0 0', padding: '24px 32px', overflow: 'hidden' },
  profileImgWrap: { position: 'relative' },
  profileImg:   { width: 180, height: 180, borderRadius: 20, border: `3px solid ${NEON}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E0E17', overflow: 'hidden' },
  editImgBtn:   { position: 'absolute', bottom: 8, right: 8, background: '#0E0E17', border: `1px solid ${NEON}`, borderRadius: '50%', width: 28, height: 28, cursor: 'not-allowed', color: NEON, fontSize: 12, opacity: 0.5 },
  email:        { color: NEON_TEXT, fontSize: 14, fontFamily: FONT },
  profileBar:   { height: 8, background: NEON, borderRadius: '0 0 16px 16px' },
  nicknamebtn:  { width: '100%', padding: '14px 0', background: '#0E0E17', border: `2px solid ${NEON}`, borderRadius: 8, color: NEON_TEXT, fontFamily: FONT, fontSize: 20, cursor: 'pointer' },
  studio:       { display: 'flex', flexDirection: 'column', minWidth: 560, maxWidth: 640, marginTop: 40 },
  studioTitle:  { fontSize: 14, color: NEON_TEXT, background: '#111', padding: '10px 16px', letterSpacing: 2, border: `1px solid #1a3a2e` },
  seqRow:       { display: 'flex', alignItems: 'center', gap: 16, padding: '18px 16px', border: `1px solid #1a3a2e`, background: 'rgba(0,0,0,0.3)', cursor: 'pointer' },
  seqNum:       { color: NEON_TEXT, fontSize: 14, width: 24, textAlign: 'center' },
  seqNumBox:    { width: 32, height: 32, background: 'rgba(0,0,0,0.5)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  seqTitle:     { color: NEON_TEXT, fontSize: 14, flex: 1 },
  seqDate:      { color: NEON_TEXT, fontSize: 12, opacity: 0.5 },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 },
  pageBtn:      { background: 'transparent', border: 'none', color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', fontSize: 16 },
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '60px 24px', background: 'rgba(0,0,0,0.3)', border: `1px solid #1a3a2e` },
  createBtn:    { padding: '10px 32px', background: '#0E0E17', border: `2px solid ${NEON}`, borderRadius: 8, color: NEON_TEXT, fontFamily: FONT, cursor: 'pointer', fontSize: 16 },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  detailModal:  { background: '#0a1a0f', border: `2px solid ${NEON}`, borderRadius: 14, padding: '40px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minWidth: 360, position: 'relative', boxShadow: '0 0 30px rgba(0,255,128,0.2)' },
  detailTitle:  { color: NEON, fontFamily: FONT, fontSize: 20, textAlign: 'center' },
  detailDate:   { color: NEON_TEXT, fontFamily: FONT, fontSize: 14, opacity: 0.6 },
  detailBtns:   { display: 'flex', gap: 16, marginTop: 8 },
  detailBtn:    { padding: '10px 32px', background: 'transparent', border: `2px solid ${NEON}`, borderRadius: 6, color: NEON, fontFamily: FONT, fontSize: 16, cursor: 'pointer' },
  closeBtn:     { position: 'absolute', top: 12, right: 16, background: 'transparent', border: 'none', color: NEON, fontSize: 20, cursor: 'pointer' },
}