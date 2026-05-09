import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'

// 페이지 import
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Main from './pages/Main/Main'
import FreeMode from './pages/EmojiJam/FreeMode/FreeMode'
import SequenceMode from './pages/EmojiJam/SequenceMode/SequenceMode'
import MalMoji from './pages/MalMoji/MalMoji'
import MojiLand from './pages/MojiLand/MojiLand'
import Ranking from './pages/Ranking/Ranking'
import MyPage from './pages/MyPage/MyPage'

// 사이드바를 숨길 경로 목록
const NO_SIDEBAR_PATHS = ['/', '/login', '/signup']

function App() {
  const location = useLocation()

  // 현재 경로가 사이드바 없는 페이지인지 확인
  const hideSidebar = NO_SIDEBAR_PATHS.includes(location.pathname)

  return (
    <div style={styles.root}>
      {/* 사이드바: 로그인/회원가입/메인에서는 숨김 */}
      {!hideSidebar && <Sidebar />}

      {/* 페이지 콘텐츠 */}
      <div style={styles.page}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/emoji-jam" element={<FreeMode />} />
          <Route path="/emoji-jam/sequence" element={<SequenceMode />} />
          <Route path="/malmoji" element={<MalMoji />} />
          <Route path="/mojiland" element={<MojiLand />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#060e0b',
  },
  page: {
    flex: 1,
    minWidth: 0,
  },
}

export default App