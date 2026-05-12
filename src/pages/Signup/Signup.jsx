import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/index'

const NEON = '#00ff80'
const BG = '#060e0b'

// 유효성 검증 함수
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePassword = (pw) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pw)
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

  // 이메일 중복 확인 (onBlur)
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

  // 닉네임 중복 확인 (onBlur)
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
    // 클라이언트 유효성 검증
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

    if (hasError) {
      setErrors(newErrors)
      return
    }

    // 회원가입 API 호출
    try {
      await api.post('/api/v1/neoliz/auth/signup', {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      })
      setSuccessMsg('회원가입이 완료되었습니다.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: '회원가입에 실패했습니다. 다시 시도해주세요.',
      }))
    }
  }

  return (
    <div style={s.root}>
      {/* 우상단 음소거 버튼 */}
      <img
            src="/src/assets/sound.png"
            alt="muteBtn"
            style={s.muteBtn}
            onError={(e) => { e.target.style.display = 'none' }}
          />

      {/* 메인 레이아웃: 좌(폼) + 우(캐릭터) */}
      <div style={s.layout}>

        {/* ── 왼쪽: 폼 영역 ── */}
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
                style={{
                  ...s.input,
                  borderColor: errors.email ? '#ff4444' : NEON,
                }}
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
                style={{
                  ...s.input,
                  borderColor: errors.password ? '#ff4444' : NEON,
                }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {/* 눈 아이콘 자리 - 실제 아이콘으로 교체 */}
                <span style={s.eyeIcon}>{showPw ? '🙉' : '🙈'}</span>
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
                style={{
                  ...s.input,
                  borderColor: errors.passwordConfirm ? '#ff4444' : NEON,
                }}
              />
              <button style={s.eyeBtn} onClick={() => setShowPwConfirm(!showPwConfirm)}>
                <span style={s.eyeIcon}>{showPwConfirm ? '🙉' : '🙈'}</span>
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
                style={{
                  ...s.input,
                  borderColor: errors.nickname ? '#ff4444' : NEON,
                }}
              />
            </div>
            {errors.nickname && <p style={s.errorMsg}>{errors.nickname}</p>}
          </div>

          {/* 일반 에러 / 성공 메시지 */}
          {errors.general && <p style={s.errorMsg}>{errors.general}</p>}
          {successMsg && <p style={s.successMsg}>{successMsg}</p>}

          {/* 회원가입 버튼 */}
          <div style={s.btnRow}>
            <button style={s.submitBtn} onClick={handleSubmit}>
              회원가입
            </button>
          </div>

          {/* 로그인 이동 */}
          <div style={s.loginRow}>
            <span style={s.loginText}>이미 계정이 있으신가요? </span>
            <span style={s.loginLink} onClick={() => navigate('/login')}>
              로그인
            </span>
          </div>
        </div>

        {/* ── 오른쪽: 캐릭터 이미지 자리 ── */}
        <div style={s.characterWrap}>
          {/* 실제 캐릭터 이미지로 교체 */}
          <img
            src="/src/assets/neoliz.png"
            alt="character"
            style={s.characterImg}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>

      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: BG,
    color: NEON,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  gridBg: {
    position: 'fixed',
    left: 0, right: 0, bottom: 0,
    height: '65%',
    backgroundImage: `
      linear-gradient(rgba(0,255,128,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,128,0.15) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    transform: 'perspective(500px) rotateX(40deg)',
    transformOrigin: 'bottom center',
    pointerEvents: 'none',
    zIndex: 0,
  },
  muteBtn: {
    position: 'fixed',
    top: 16, right: 16,
    zIndex: 200,
    background: 'transparent',
    color: NEON,
    borderRadius: 0,
    width: 24, height: 24,
    fontSize: 1,
    cursor: 'pointer',
  },
  layout: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '40px 60px',
    boxSizing: 'border-box',
    gap: 40,
  },

  // 폼 영역
  formWrap: {
    flex: 1,
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: NEON,
    margin: '0 0 32px',
    letterSpacing: 4,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    textShadow: '0 0 20px rgba(0,255,128,0.5)',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 12,
  },
  inputRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    background: 'rgba(0,255,128,0.05)',
    border: `2px solid ${NEON}`,
    borderRadius: 6,
    color: NEON,
    fontSize: 15,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  errorMsg: {
    color: '#ff4444',
    fontSize: 12,
    margin: '4px 0 0',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  successMsg: {
    color: NEON,
    fontSize: 13,
    margin: '4px 0',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  submitBtn: {
    padding: '12px 32px',
    background: 'transparent',
    border: `2px solid ${NEON}`,
    borderRadius: 6,
    color: NEON,
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    letterSpacing: 2,
    transition: 'background 0.2s',
  },
  loginRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 4,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: NEON,
    opacity: 0.7,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },
  loginLink: {
    fontSize: 15,
    color: NEON,
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
  },

  // 캐릭터 영역
  characterWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  characterImg: {
    maxWidth: '120%',
    maxHeight: 480,
    objectFit: 'contain',
    imageRendering: 'pixelated',
  },
}