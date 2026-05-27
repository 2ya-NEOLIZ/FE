import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'
const ERROR = '#ff4444'

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', general: '' })
  const [showPw, setShowPw] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors({ email: '', general: '' })
  }

  const handleSubmit = async () => {
    if (!validateEmail(form.email)) {
      setErrors({ email: '올바른 이메일을 입력해주세요.', general: '' })
      return
    }
    try {
      const res = await api.post('/api/v1/neoliz/auth/login', {
        email: form.email,
        password: form.password,
      })
      const { accessToken, refreshToken, user } = res.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('nickname', user.nickname)
      localStorage.setItem('userId', String(user.id))
      if (user.profileImageUrl) {
        localStorage.setItem('profileImageUrl', user.profileImageUrl)
      }

      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setErrors({ email: '', general: '이메일 또는 비밀번호가 올바르지 않습니다.' })
      } else {
        setErrors({ email: '', general: '로그인에 실패했습니다. 다시 시도해주세요.' })
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={s.wrap}>
      <style>{`
        @font-face {
          font-family: 'NeoDunggeunmo';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff') format('woff');
        }
        *, *::before, *::after { box-sizing: border-box; }
        input::placeholder { color: ${NEON_TEXT}55; }
        input:focus { outline: none; }
      `}</style>

      {/* 배경 영상 */}
      <video autoPlay loop muted playsInline style={s.bgVideo}>
        <source src="/src/assets/Neon-grid-crop.mp4" type="video/mp4" />
      </video>

      {/* 우상단 사운드 아이콘 */}
      <img
        src="/src/assets/sound.png"
        alt="sound"
        style={s.soundIcon}
        onError={(e) => { e.target.style.display = 'none' }}
      />

      <div style={s.center}>
        <h1 style={s.title}>로그인</h1>
        <p style={s.subtitle}>로그인 후 사용을 시작해 주세요!</p>

        <div style={s.formWrap}>

          {/* 이메일 */}
          <div style={s.fieldWrap}>
            <p style={s.label}>ID :</p>
            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ ...s.input, borderColor: errors.email ? ERROR : NEON }}
            />
            {errors.email && <p style={s.errorMsg}>{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div style={s.fieldWrap}>
            <p style={s.label}>PASSWORD :</p>
            <div style={s.inputRow}>
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••••••••••••"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={{ ...s.input, paddingRight: 56, borderColor: errors.general ? ERROR : NEON }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
                <img
                  src={showPw ? '/src/assets/view_hide.png' : '/src/assets/view.png'}
                  style={{ width: 24, height: 24 }}
                  onError={(e) => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: showPw ? '🙉' : '🙈', style: 'font-size:18px' })) }}
                />
              </button>
            </div>
            {errors.general && <p style={s.errorMsg}>{errors.general}</p>}
          </div>

          {/* 로그인 버튼 */}
          <div style={s.btnRow}>
            <button style={s.submitBtn} onClick={handleSubmit}>로그인</button>
          </div>
        </div>

        {/* 하단 회원가입 링크 */}
        <div style={s.signupRow}>
          <span style={s.signupLink} onClick={() => navigate('/signup')}>회원가입</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', background: BG,
    fontFamily: FONT, color: NEON,
    position: 'relative', overflow: 'hidden',
  },
  bgVideo: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', zIndex: 0, opacity: 0.7,
  },
  soundIcon: {
    position: 'fixed', top: 14, right: 14,
    zIndex: 300, width: 26, height: 26, cursor: 'pointer',
  },
  center: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: '40px 20px',
  },
  title: {
    fontSize: 52, fontWeight: 'bold', color: NEON_TEXT,
    margin: '0 0 12px', letterSpacing: 8, fontFamily: FONT,
    textShadow: `0 0 24px ${NEON}88`,
  },
  subtitle: {
    fontSize: 18, color: NEON_TEXT, margin: '0 0 40px',
    letterSpacing: 2, opacity: 0.7, fontFamily: FONT,
  },
  formWrap: {
    width: '100%', maxWidth: 520,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  fieldWrap: {
    display: 'flex', flexDirection: 'column', marginBottom: 20,
  },
  label: {
    fontSize: 22, color: NEON_TEXT, margin: '0 0 8px',
    letterSpacing: 2, fontFamily: FONT,
  },
  inputRow: {
    position: 'relative', display: 'flex', alignItems: 'center',
  },
  input: {
    width: '100%', padding: '16px 20px',
    background: '#0E0E17',
    border: `1px solid ${NEON}`,
    borderRadius: 2, color: NEON_TEXT, fontSize: 18,
    fontFamily: FONT, outline: 'none',
    boxShadow: `8px 8px 0px ${NEON}`,
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 16,
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center',
  },
  errorMsg: {
    color: ERROR, fontSize: 13, margin: '6px 0 0', fontFamily: FONT,
  },
  btnRow: {
    display: 'flex', justifyContent: 'flex-end', marginTop: 8,
  },
  submitBtn: {
    padding: '16px 48px',
    background: '#0E0E17',
    border: `1px solid ${NEON}`,
    borderRadius: 2, color: NEON_TEXT,
    fontSize: 20, fontWeight: 'bold', cursor: 'pointer',
    fontFamily: FONT, letterSpacing: 2,
    boxShadow: `8px 8px 0px ${NEON}`,
    transition: 'opacity 0.15s',
  },
  signupRow: {
    width: '100%', maxWidth: 520,
    display: 'flex', justifyContent: 'flex-end', marginTop: 24,
  },
  signupLink: {
    fontSize: 16, color: NEON_TEXT, fontWeight: 'bold',
    cursor: 'pointer', textDecoration: 'underline',
    fontFamily: FONT, letterSpacing: 1, opacity: 0.8,
  },
}