import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Main from './pages/Main/Main'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import MyPage from './pages/MyPage/MyPage'

import FreeMode from './pages/EmojiJam/FreeMode/FreeMode'
import SequenceMode from './pages/EmojiJam/SequenceMode/SequenceMode'

import MalMoji from './pages/MalMoji/MalMoji'
import MojiLand from './pages/MojiLand/MojiLand'
import Ranking from './pages/Ranking/Ranking'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />

        <Route path="/emojijam/free" element={<FreeMode />} />
        <Route path="/emojijam/sequence" element={<SequenceMode />} />

        <Route path="/malmoji" element={<MalMoji />} />
        <Route path="/mojiland" element={<MojiLand />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App