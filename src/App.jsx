import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import RotateOverlay from './components/RotateOverlay/RotateOverlay'

import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Main from './pages/Main/Main'
import FreeMode from './pages/EmojiJam/FreeMode/FreeMode'
import SequenceMode from './pages/EmojiJam/SequenceMode/SequenceMode'
import MalMoji from './pages/MalMoji/MalMoji'
import MojiLand from './pages/MojiLand/MojiLand'
import Ranking from './pages/Ranking/Ranking'
import MyPage from './pages/MyPage/MyPage'

const NO_SIDEBAR_PATHS = ['/', '/login', '/signup']

function App() {
  const location = useLocation()
  const hideSidebar = NO_SIDEBAR_PATHS.includes(location.pathname)

  return (
    <>
      <RotateOverlay />

      <div style={styles.root}>
        {!hideSidebar && <Sidebar />}
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
    </>
  )
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: '#060e0b' },
  page: { flex: 1, minWidth: 0 },
}

export default App