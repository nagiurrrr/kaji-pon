import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(<h1>家事ポン！</h1>)

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
