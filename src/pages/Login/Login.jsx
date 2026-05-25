import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'

const NEON = '#00ff80'
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

      // 토큰 + 유저 정보 저장
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
    <div style={s.root}>
      <div style={s.gridBg} />

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
                style={{ ...s.input, paddingRight: 48, borderColor: errors.general ? ERROR : NEON }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
                <span style={s.eyeIcon}>{showPw ? '🙉' : '🙈'}</span>
              </button>
            </div>
            {errors.general && <p style={s.errorMsg}>{errors.general}</p>}
          </div>

          {/* 로그인 버튼 */}
          <div style={s.btnRow}>
            <button style={s.loginBtn} onClick={handleSubmit}>로그인</button>
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
  root: {
    minHeight: '100vh', width: '100%', background: BG, color: NEON,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
  },
  soundIcon: { position: 'fixed', top: 16, right: 16, zIndex: 200, width: 24, height: 24, cursor: 'pointer' },
  center: {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box',
  },
  title: {
    fontSize: 52, fontWeight: 'bold', color: NEON, margin: '0 0 12px',
    letterSpacing: 8, fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    textShadow: '0 0 20px rgba(0,255,128,0.5)',
  },
  subtitle: {
    fontSize: 20, color: NEON, margin: '0 0 40px', letterSpacing: 2,
    opacity: 0.85, fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  formWrap: { width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 4 },
  fieldWrap: { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label: {
    fontSize: 18, color: NEON, margin: '0 0 6px', letterSpacing: 1,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  inputRow: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', padding: '14px 16px', background: 'rgba(0,20,10,0.7)',
    border: `2px solid ${NEON}`, borderRadius: 6, color: NEON, fontSize: 15,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  eyeBtn: { position: 'absolute', right: 12, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  eyeIcon: { fontSize: 18, opacity: 0.7 },
  errorMsg: { color: ERROR, fontSize: 12, margin: '4px 0 0', fontFamily: '"NeoDunggeunmo", "Courier New", monospace' },
  btnRow: { display: 'flex', justifyContent: 'center', marginTop: 16 },
  loginBtn: {
    padding: '12px 48px', background: 'transparent', border: `2px solid ${NEON}`,
    borderRadius: 6, color: NEON, fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace', letterSpacing: 2, transition: 'background 0.2s',
  },
  signupRow: { width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'flex-end', marginTop: 24 },
  signupLink: {
    fontSize: 15, color: NEON, fontWeight: 'bold', cursor: 'pointer',
    textDecoration: 'underline', fontFamily: '"NeoDunggeunmo", "Courier New", monospace', letterSpacing: 1,
  },
}