const NEON = '#00ff80'

/**
 * 공통 Modal 컴포넌트
 *
 * 사용 예시:
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   message="이메일 또는 비밀번호가 올바르지 않습니다."
 *   confirmText="확인"
 *   onConfirm={() => setShowModal(false)}
 * />
 *
 * Props:
 * - isOpen (boolean): 모달 표시 여부
 * - onClose (function): 오버레이 클릭 시 닫기
 * - message (string): 모달 내용 텍스트
 * - confirmText (string): 확인 버튼 텍스트 (기본값: "확인")
 * - onConfirm (function): 확인 버튼 클릭 시 동작
 * - cancelText (string): 취소 버튼 텍스트 (선택)
 * - onCancel (function): 취소 버튼 클릭 시 동작 (선택)
 * - borderColor (string): 테두리 색상 커스텀 (기본값: NEON)
 */
export default function Modal({
  isOpen,
  onClose,
  message,
  confirmText = '확인',
  onConfirm,
  cancelText,
  onCancel,
  borderColor = NEON,
}) {
  if (!isOpen) return null

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{ ...s.modal, borderColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={s.message}>{message}</p>

        <div style={s.btnRow}>
          {cancelText && (
            <button
              style={{ ...s.btn, borderColor }}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            style={{ ...s.btn, borderColor, color: borderColor }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
  },
  modal: {
    background: '#0a1a0f',
    border: '2px solid',
    borderRadius: 14,
    padding: '32px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    boxShadow: '0 0 30px rgba(0,255,128,0.2)',
    minWidth: 280,
  },
  message: {
    color: NEON,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 1.8,
    margin: 0,
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    whiteSpace: 'pre-line',
  },
  btnRow: {
    display: 'flex',
    gap: 12,
  },
  btn: {
    padding: '10px 36px',
    background: 'transparent',
    border: '2px solid',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: '"NeoDunggeunmo", "Courier New", monospace',
    letterSpacing: 1,
    color: NEON,
    transition: 'background 0.2s',
  },
}