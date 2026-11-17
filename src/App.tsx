import { useEffect } from 'react'
import { installRemoteControl, trackNavigation, usePath } from './lib/nav'
import { useSettings } from './lib/storage'
import Editor from './screens/Editor'
import Home from './screens/Home'
import { PlaylistEditor, PlaylistList } from './screens/Playlists'
import Run from './screens/Run'
import Scoreboard from './screens/Scoreboard'
import Settings from './screens/Settings'
import Timers from './screens/Timers'

function Router({ path }: { path: string }) {
  const [, a, b] = path.split('/')
  switch (a) {
    case 'timers':
      return <Timers />
    case 'edit':
      return <Editor key={b} id={b ?? 'new'} />
    case 'run':
      return <Run key={b} kind="timer" id={b ?? ''} />
    case 'run-playlist':
      return <Run key={b} kind="playlist" id={b ?? ''} />
    case 'tv':
      return <Run key="tv" kind="tv" id="" />
    case 'scoreboard':
      return <Scoreboard />
    case 'playlists':
      return <PlaylistList />
    case 'playlist-edit':
      return <PlaylistEditor key={b} id={b ?? 'new'} />
    case 'settings':
      return <Settings />
    default:
      return <Home />
  }
}

export default function App() {
  const path = usePath()
  const [s] = useSettings()

  useEffect(() => {
    trackNavigation()
    return installRemoteControl()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', s.accent)
    document.title = `${s.academy} Timer`
  }, [s.accent, s.academy])

  const bg = s.bgUrl.trim() ? { backgroundImage: `linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.82)), url("${s.bgUrl.replace(/"/g, '')}")` } : undefined
  return (
    <div className="app" style={bg}>
      <Router path={path} />
    </div>
  )
}
