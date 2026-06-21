import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from './AuthProvider'
import { hebrewAuthError } from './authErrors'

type Mode = 'signin' | 'signup'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  const toggleMode = () => {
    setMode(isSignup ? 'signin' : 'signup')
    setError(null)
    setInfo(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (isSignup) {
        const { needsConfirmation } = await signUp(email, password)
        if (needsConfirmation) {
          setInfo('נשלח אליך מייל לאימות הכתובת. יש לאשר אותו ואז להתחבר.')
        }
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(hebrewAuthError(message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {isSignup ? 'הרשמה' : 'התחברות'}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {info && <Alert severity="success">{info}</Alert>}

            <TextField
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {isSignup ? 'יצירת חשבון' : 'התחברות'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {isSignup ? 'כבר יש לך חשבון? ' : 'אין לך חשבון עדיין? '}
              <Link component="button" type="button" onClick={toggleMode}>
                {isSignup ? 'להתחברות' : 'להרשמה'}
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
