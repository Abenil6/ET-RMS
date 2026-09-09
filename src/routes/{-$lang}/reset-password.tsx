import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'

type ResetPasswordSearch = {
  token?: string
}

export const Route = createFileRoute('/{-$lang}/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : '',
    }
  },
  component: ResetPasswordPage,
})
