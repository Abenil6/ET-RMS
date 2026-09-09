import { createFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

export const Route = createFileRoute('/{-$lang}/register')({
  component: RegisterPage,
})
