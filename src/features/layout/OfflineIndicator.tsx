import { useEffect, useState } from 'react'
import { Alert } from '@mui/material'

// Placeholder offline indicator (EC-14): shows a banner while the browser is
// offline. Full offline handling (blocking edits) is implemented in a later task.
export function OfflineIndicator() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null
  return (
    <Alert severity="warning" square>
      אין חיבור לאינטרנט — ייתכן שחלק מהפעולות לא יהיו זמינות.
    </Alert>
  )
}
