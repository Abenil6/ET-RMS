// src/components/ErrorMessage.tsx
import { XCircle } from 'lucide-react'

interface ErrorMessageProps {
    title?: string
    message: string
    retry?: () => void
}

export function ErrorMessage({
    title = 'Error',
    message,
    retry
}: ErrorMessageProps) {
    return (
        <div className="p-8">
            <div className="max-w-md mx-auto bg-error/10 border border-error rounded-lg p-6">
                <div className="flex gap-3">
                    <XCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-error mb-1">{title}</h3>
                        <p className="text-sm text-text-secondary mb-4">{message}</p>
                        {retry && (
                            <button
                                onClick={retry}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Try again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}