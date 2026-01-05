import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import Test from './test.tsx'
import Home from './Home.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Test /> */}
    <Home />
  </StrictMode>,
)
