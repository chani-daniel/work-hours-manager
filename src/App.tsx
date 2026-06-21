import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

// Sample screen proving the MUI RTL theme works with inline Hebrew text.
// Real screens are added in later tasks (TASK-011 onward).
function App() {
  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            ניהול שעות עבודה
          </Typography>

          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  יעד חודשי
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  זהו מסך דוגמה שמדגים את תמת MUI מימין-לשמאל. הטקסט נכתב ישירות
                  בעברית, וההזחה והיישור מתהפכים אוטומטית.
                </Typography>
                <TextField
                  label="שעות יעד לחודש"
                  type="number"
                  fullWidth
                  helperText="לדוגמה: 180"
                />
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained">שמירת יעד</Button>
                  <Button variant="outlined">ביטול</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
