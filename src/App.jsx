import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'

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
const ROTATE_BREAKPOINT = 900

function App() {
  const location = useLocation()
  const hideSidebar = NO_SIDEBAR_PATHS.includes(location.pathname)

  return (
    <>
      {/* 모바일 세로모드 강제 가로회전 */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
        }

        .rotate-wrap {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
        }

        @media screen and (max-width: ${ROTATE_BREAKPOINT}px) and (orientation: portrait) {
          html, body, #root {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          .rotate-wrap {
            width: 100vh;
            height: 100vw;
            transform-origin: top left;
            transform: rotate(90deg);
            top: 0;
            left: 100%;
          }
        }

        .rotate-inner {
          width: 100%;
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      <div className="rotate-wrap">
        <div className="rotate-inner">
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
        </div>
      </div>
    </>
  )
}

const styles = {
  root: { display: 'flex', minHeight: '100%', background: '#060e0b' },
  page: { flex: 1, minWidth: 0 },
}

export default App