import { useNavigate } from 'react-router-dom'
import neolizLogo from '../../assets/neoliz.png'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'

const NEON = '#1DED83'
const BG = '#060e0b'
const FONT = 'NeoDunggeunmo, monospace'  

export default function Main() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('accessToken')

  return (
    <div style={s.root}>
      {/* 폰트 로드 */}
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* 네온 그리드 배경 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={s.video}
      >
        <source src={neonGridVideo} type="video/mp4" />
      </video>

      <div style={s.overlay} />

      <div style={s.center}>
        <img src={neolizLogo} alt="NEOLIZ" style={s.logo} />

        {isLoggedIn ? (
          <span 
            style={s.link} 
            onClick={() => navigate('/mypage')}
          >
            마이페이지
          </span>
        ) : (
          <span 
            style={s.link} 
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        )}
      </div>
    </div>
  )
}

const s = {
  root: {
    width: '100vw',
    minHeight: '100vh',
    background: BG,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT,
  },
  video: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60%',
    objectFit: 'cover',
    objectPosition: 'bottom',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'linear-gradient(to bottom, #060e0b 30%, transparent 100%)',
  },
  center: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  logo: {
    width: 500,
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 0 12px rgba(29,237,131,0.4))',
  },
  link: {
    color: NEON,
    fontSize: 30,
    fontFamily: FONT,           
    textDecoration: 'underline',
    cursor: 'pointer',
    letterSpacing: 1,
    opacity: 0.9,
  },
}