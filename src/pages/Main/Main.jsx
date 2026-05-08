// src/pages/Main/Main.jsx

import Sidebar from "../../components/Sidebar/Sidebar"

function Main() {
  return (
    <div className="min-h-screen bg-black text-white flex">
      
      <Sidebar />

      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-5xl font-bold">
          LIZARD
        </h1>
      </main>

    </div>
  )
}

export default Main