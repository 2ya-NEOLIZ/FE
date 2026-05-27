import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import neolizImg from '../../assets/neoliz.png'   // 추가
import playImg from '../../assets/play.png'

const NEON = '#00ff80'

const SIDEBAR_ITEMS = [
  {
    label: 'EMOJI\n-JAM',
    path: '/emoji-jam',
    subItems: [
      { label: '자유모드', path: '/emoji-jam' },
      { label: '시퀀스모드', path: '/emoji-jam/sequence' },
    ],
  },
  { label: '말모지', path: '/malmoji' },
  { label: '모지\n랜드', path: '/mojiland' },
  { label: 'RANK', path: '/ranking' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  // 로그인/회원가입/메인에서는 숨김
  const hidePaths = ['/', '/login', '/signup']
  if (hidePaths.includes(location.pathname)) return null

  // 이모지잼 경로인지 확인
  const isEmojiJam = location.pathname.startsWith('/emoji-jam')

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
          src={playImg}
          onClick={() => setIsOpen(v => !v)}
          alt="toggle"
          style={{
            ...s.toggleBtn,
            position: 'fixed',
            left: isOpen ? 100 : 10,
            top: 20,
            zIndex: 999,
            transition: 'left 0.3s ease',
          }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />

        {/* 로고 */}
        {isOpen && (
          <>
            <img
              src={neolizImg}
              alt="NEOLIZ"
              style={s.logoImg}
              onClick={() => navigate('/')}
              onError={(e) => { e.target.style.display = 'none' }}
            />

            {/* 메뉴 */}
            <div style={s.menuWrap}>
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path)

                return (
                  <div key={item.label} style={s.itemWrap}>
                    {/* 메인 메뉴 버튼 */}
                    <button
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

                    {/* 이모지잼 서브메뉴 */}
                    {item.subItems && isEmojiJam && isActive && (
                      <div style={s.subMenu}>
                        {item.subItems.map((sub) => {
                          const isSubActive = location.pathname === sub.path
                          return (
                            <button
                              key={sub.label}
                              onClick={() => navigate(sub.path)}
                              style={{
                                ...s.subItem,
                                color: isSubActive ? NEON : '#1e4a2e',
                                borderLeft: isSubActive
                                  ? `2px solid ${NEON}`
                                  : '2px solid #1e4a2e',
                              }}
                            >
                              {sub.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
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
    flexShrink: 0,
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
    borderColor: NEON,
    objectFit: 'contain',
    cursor: 'pointer',
    marginBottom: 35,
    marginTop: 10,
  },
  menuWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  itemWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
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
  subMenu: {
    display: 'flex',
    flexDirection: 'column',
    width: '80%',
    marginTop: 6,
    gap: 4,
  },
  subItem: {
    background: 'transparent',
    border: 'none',
    borderLeft: `2px solid #1e4a2e`,
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 4,
    color: NEON,
    fontFamily: 'NeoDunggeunmo, monospace',
    fontSize: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
}