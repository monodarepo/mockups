import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import { router } from './router'

const container = document.getElementById('root')
if (!container) throw new Error('Elemento #root não encontrado.')

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>,
)
