                                        
'use client'

import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ value, onChange, onSend, disabled, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

                         
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
    }
  }

  return (
    <div className="ai-assistant-chat-input border-t p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="ai-assistant-textarea flex-1 overflow-hidden transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? 'Ask something about the document…'}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full bg-transparent text-sm placeholder:text-muted-foreground',
              'px-4 py-3 resize-none outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={cn(
            'ai-assistant-send flex items-center justify-center w-10 h-10 shrink-0 transition-colors',
            disabled || !value.trim()
              ? 'cursor-not-allowed'
              : ''
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="ai-assistant-hint text-center text-[10px] mt-2 max-w-4xl mx-auto">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
