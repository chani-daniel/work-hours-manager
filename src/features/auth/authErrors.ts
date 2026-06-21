// Map common Supabase auth error messages to Hebrew, user-facing text.
export function hebrewAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'אימייל או סיסמה שגויים.'
  if (m.includes('email not confirmed')) return 'יש לאמת את כתובת האימייל לפני ההתחברות (בדקי את תיבת הדואר).'
  if (m.includes('already registered') || m.includes('already exists')) return 'כתובת האימייל כבר רשומה. נסי להתחבר.'
  if (m.includes('password should be at least')) return 'הסיסמה קצרה מדי (לפחות 6 תווים).'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'כתובת האימייל אינה תקינה.'
  if (m.includes('popup')) return 'חלון ההתחברות נחסם. יש לאפשר חלונות קופצים ולנסות שוב.'
  if (m.includes('network') || m.includes('failed to fetch')) return 'בעיית תקשורת. בדקי את החיבור לאינטרנט ונסי שוב.'
  return 'אירעה שגיאה. נסי שוב.'
}
