import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'
import neonGridVideo from '../../assets/Neon-grid-crop.mp4'
import soundIcon from '../../assets/sound.png'
import viewIcon from '../../assets/View.png'
import viewHideIcon from '../../assets/View_hide.png'

const NEON = '#1DED83'
const NEON_TEXT = '#1EC770'
const FONT = 'NeoDunggeunmo, monospace'
const BG = '#060e0b'

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const validatePassword = (pw) =>
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pw)

const validateNickname = (nick) => {
  if (nick.length < 2 || nick.length > 10) return '2~10자로 입력해주세요.'
  if (/[!@#$%^&*(),.?":{}|<>]/.test(nick)) return '특수문자는 사용할 수 없습니다.'
  return null
}

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    general: '',
  })

  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }))
    setSuccessMsg('')
  }

  const handleEmailBlur = async () => {
    if (!form.email) return
    if (!validateEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: '이메일 형식이 올바르지 않습니다.' }))
      return
    }
    try {
      await api.get(`/api/v1/neoliz/auth/check-email?email=${form.email}`)
      setErrors((prev) => ({ ...prev, email: '' }))
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }))
      }
    }
  }

  const handleNicknameBlur = async () => {
    if (!form.nickname) return
    const validErr = validateNickname(form.nickname)
    if (validErr) {
      setErrors((prev) => ({ ...prev, nickname: validErr }))
      return
    }
    try {
      await api.get(`/api/v1/neoliz/auth/check-nickname?nickname=${form.nickname}`)
      setErrors((prev) => ({ ...prev, nickname: '' }))
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors((prev) => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }))
      }
    }
  }

  const handleSubmit = async () => {
    let hasError = false
    const newErrors = { email: '', password: '', passwordConfirm: '', nickname: '', general: '' }

    if (!validateEmail(form.email)) {
      newErrors.email = '이메일 형식이 올바르지 않습니다.'
      hasError = true
    }
    if (!validatePassword(form.password)) {
      newErrors.password = '8자 이상, 영문+숫자+특수문자를 포함해주세요.'
      hasError = true
    }
    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
      hasError = true
    }
    const nickErr = validateNickname(form.nickname)
    if (nickErr) {
      newErrors.nickname = nickErr
      hasError = true
    }

    if (hasError) { setErrors(newErrors); return }

    try {
      await api.post('/api/v1/neoliz/auth/signup', {
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        nickname: form.nickname,
      })
      setSuccessMsg('회원가입이 완료되었습니다.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const status = err.response?.status
      if (status === 409) {
        setErrors((prev) => ({ ...prev, general: '이미 사용 중인 이메일 또는 닉네임입니다.' }))
      } else {
        setErrors((prev) => ({ ...prev, general: '회원가입에 실패했습니다. 다시 시도해주세요.' }))
      }
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
        input::placeholder { color: ${NEON_TEXT}55; }
        input:focus { outline: none; }
      `}</style>

      {/* 배경 영상 */}
      <video autoPlay loop muted playsInline style={s.bgVideo}>
        <source src={neonGridVideo} />
      </video>

      <img src={soundIcon}
        alt="sound"
        style={s.soundIcon}
        onError={(e) => { e.target.style.display = 'none' }}
      />

      <div style={s.center}>
        <div style={s.formWrap}>
          <h1 style={s.title}>회원가입</h1>

          {/* 이메일 */}
          <div style={s.fieldWrap}>
            <div style={s.inputRow}>
              <input
                name="email"
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                style={{ ...s.input, borderColor: errors.email ? '#ff4444' : NEON }}
              />
            </div>
            {errors.email && <p style={s.errorMsg}>{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div style={s.fieldWrap}>
            <div style={s.inputRow}>
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                value={form.password}
                onChange={handleChange}
                style={{ ...s.input, paddingRight: 56, borderColor: errors.password ? '#ff4444' : NEON }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
                <img src={showPw ? viewHideIcon : viewIcon} style={{ width: 24, height: 24 }} />
              </button>
            </div>
            {errors.password && <p style={s.errorMsg}>{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div style={s.fieldWrap}>
            <div style={s.inputRow}>
              <input
                name="passwordConfirm"
                type={showPwConfirm ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                value={form.passwordConfirm}
                onChange={handleChange}
                style={{ ...s.input, paddingRight: 56, borderColor: errors.passwordConfirm ? '#ff4444' : NEON }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPwConfirm(!showPwConfirm)}>
                <img src={showPwConfirm ? viewHideIcon : viewIcon} style={{ width: 24, height: 24 }} />
              </button>
            </div>
            {errors.passwordConfirm && <p style={s.errorMsg}>{errors.passwordConfirm}</p>}
          </div>

          {/* 닉네임 */}
          <div style={s.fieldWrap}>
            <div style={s.inputRow}>
              <input
                name="nickname"
                type="text"
                placeholder="닉네임"
                value={form.nickname}
                onChange={handleChange}
                onBlur={handleNicknameBlur}
                style={{ ...s.input, borderColor: errors.nickname ? '#ff4444' : NEON }}
              />
            </div>
            {errors.nickname && <p style={s.errorMsg}>{errors.nickname}</p>}
          </div>

          {errors.general && <p style={s.errorMsg}>{errors.general}</p>}
          {successMsg && <p style={s.successMsg}>{successMsg}</p>}

          <div style={s.btnRow}>
            <button style={s.submitBtn} onClick={handleSubmit}>회원가입</button>
          </div>

          <div style={s.loginRow}>
            <span style={s.loginText}>이미 계정이 있으신가요?</span>
            <span style={s.loginLink} onClick={() => navigate('/login')}>로그인</span>
          </div>
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
  formWrap: {
    width: '100%', maxWidth: 520,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  title: {
    fontSize: 48, fontWeight: 'bold', color: NEON_TEXT,
    margin: '0 0 32px', letterSpacing: 6, fontFamily: FONT,
    textShadow: `0 0 24px ${NEON}88`,
  },
  fieldWrap: {
    display: 'flex', flexDirection: 'column', marginBottom: 16,
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
    color: '#ff4444', fontSize: 13, margin: '6px 0 0', fontFamily: FONT,
  },
  successMsg: {
    color: NEON_TEXT, fontSize: 14, margin: '4px 0', fontFamily: FONT,
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
  loginRow: {
    display: 'flex', justifyContent: 'flex-end',
    marginTop: 24, gap: 6, alignItems: 'center',
  },
  loginText: {
    fontSize: 15, color: NEON_TEXT, opacity: 0.7, fontFamily: FONT,
  },
  loginLink: {
    fontSize: 15, color: NEON_TEXT, fontWeight: 'bold',
    cursor: 'pointer', textDecoration: 'underline',
    fontFamily: FONT, letterSpacing: 1,
  },
}