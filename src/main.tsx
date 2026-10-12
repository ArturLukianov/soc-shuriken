import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LookupCache } from './lib/cache'

LookupCache.pruneExpired()

createRoot(document.getElementById('root')!).render(
  <App />,
)
