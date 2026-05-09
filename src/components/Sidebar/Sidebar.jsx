import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const NEON = '#00ff80'

const SIDEBAR_ITEMS = [
  { label: 'EMOJI\n-JAM', path: '/emoji-jam' },
  { label: '말모지', path: '/malmoji' },
  { label: '모지\n랜드', path: '/mojiland' },
  { label: 'RANK', path: '/ranking' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  if (location.pathname === '/') return null

  return (
    <>
      {/* 폰트 등록 */}
      <style>
        {`
          @font-face {
            font-family: 'NeoDunggeunmo';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
            font-weight: bold;
            font-display: swap;
          }
        `}
      </style>

      <div
        style={{
          ...s.sidebar,
          width: isOpen ? 90 : 0,
        }}
      >
        {/* 토글 버튼 (사이드바 바깥) */}
        <img
          src="/src/assets/play.png"
          onClick={() => setIsOpen(v => !v)}
          style={{
            ...s.toggleBtn,
            position: 'fixed',
            left: isOpen ? 100 : 10,
            top: 20,
            zIndex: 999,
            transition: 'left 0.3s ease',
          }}
        />

        {/* 로고 */}
        {isOpen && (
          <img
            src="/src/assets/neoliz.png"
            alt="NEOLIZ"
            style={s.logoImg}
            onClick={() => navigate('/')}
          />
        )}

        {/* 메뉴 */}
        {isOpen && (
          <div style={s.menuWrap}>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path)

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...s.item,
                    background: isActive
                      ? 'rgba(0,255,128,0.15)'
                      : 'transparent',
                    borderColor: isActive ? NEON : '#1e4a2e',
                  }}
                >
                  <span style={s.itemLabel}>{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

const s = {
  sidebar: {
    minHeight: '100vh',
    background: 'rgba(5,12,10,0.97)',
    borderRight: '1px solid #1a3a2e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    transition: 'width 0.3s ease',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    overflow: 'hidden',
    fontFamily: 'NeoDunggeunmo, monospace',
  },

  toggleBtn: {
    width: 28,
    height: 28,
    cursor: 'pointer',
  },

  logoImg: {
    width: 60,
    height: 60,
    border: '2px solid',
    borderRadius: 12,
    color: NEON,
    objectFit: 'contain',
    objectPosition: 'top', 
    cursor: 'pointer',
    marginBottom: 35,
  },

  menuWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },

  item: {
    width: 60,
    height: 60,
    border: '2px solid',
    borderRadius: 12,
    color: NEON,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    transition: 'all 0.2s',
  },

  itemLabel: {
    fontSize: 11,
    whiteSpace: 'pre',
    textAlign: 'center',
    lineHeight: 1.4,
    fontFamily: 'NeoDunggeunmo, monospace',
  },
}