import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Stats from './components/Stats'
import LineupsTool from './components/LineupsTool'  

function App() {
  return (
    <>
      <BrowserRouter>
        <nav className='bg-black text-white flex gap-4 p-3.5'>
          <Link to='/'>Home</Link>
          <Link to='/stats'>Stats</Link>
          <Link to='/lineups-tool'>Lineups Tool</Link>
        </nav>

        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/stats' element={<Stats/>} />
          <Route path='/lineups-tool' element={<LineupsTool/>} />
        </Routes>
      </BrowserRouter>


    </>
  )
}

export default App
