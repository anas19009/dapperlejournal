'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent as TipTapContent } from '@tiptap/react'
import { extensions } from './extensions'
import { Toolbar } from './Toolbar'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

                                                                               
                                                 
export function parseEditorContent(value: string): object | string {
  try {
    return JSON.parse(value) as object
  } catch {
    return value
  }
}

export function Editor({ value, onChange, className }: EditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInternalUpdate = useRef(false)

  const handleUpdate = useCallback(
    ({ editor }: { editor: { getJSON: () => object } }) => {
      if (isInternalUpdate.current) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(JSON.stringify(editor.getJSON()))
      }, 300)
    },
    [onChange]
  )

  const editor = useEditor({
    extensions,
    content: value ? parseEditorContent(value) : '',
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

                                                                     
  useEffect(() => {
    if (!editor || !value) return
    const parsed = parseEditorContent(value)
    if (typeof parsed === 'object') {
                                                                    
      if (JSON.stringify(parsed) === JSON.stringify(editor.getJSON())) return
    }
    isInternalUpdate.current = true
    editor.commands.setContent(parsed)
    isInternalUpdate.current = false
  }, [editor, value])

  if (!editor) return null

  return (
    <div className={`editor-content-card overflow-hidden ${className ?? ''}`}>
      <Toolbar editor={editor} />
      <TipTapContent editor={editor} />
      <div className="px-4 py-1.5 border-t text-xs text-muted-foreground text-right select-none">
        {editor.storage.characterCount?.words() ?? 0} words
        {' · '}
        {editor.storage.characterCount?.characters() ?? 0} characters
      </div>
    </div>
  )
}
