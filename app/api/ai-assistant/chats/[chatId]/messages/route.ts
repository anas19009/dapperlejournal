                                                        
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMessages, addMessage, updateChatLastMessage, updateChatTitle, getChat, getBookById,
} from '@/features/ai-assistant/chatService'
import { sendMessage, generateChatTitle, isRateLimitError } from '@/features/ai-assistant/llmService'
import { getDecryptedApiKey } from '@/features/ai-assistant/llmKeyService'
import type { LLMProvider } from '@/features/ai-assistant/types'

type Params = { params: { chatId: string } }
                               
export async function GET(_req: NextRequest, { params }: Params) {
  const { chatId } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await getChat(chatId)
  if (!chat || chat.user_id !== user.id) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  const messages = await getMessages(chatId)
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { chatId } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await getChat(chatId)
  if (!chat || chat.user_id !== user.id) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 })
  }

                                                                         
                                                                              
                                                                  
  const existingHistory = await getMessages(chatId)
  const isFirstMessage = existingHistory.filter((m) => m.role === 'user').length === 0
  const history: typeof existingHistory = [
    ...existingHistory,
    { id: 'pending', chat_id: chatId, role: 'user', content: content.trim(), created_at: new Date().toISOString() },
  ]

                          
  let apiKey: string
  try {
    apiKey = await getDecryptedApiKey(chat.llm_provider as LLMProvider)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'No API key configured' },
      { status: 422 }
    )
  }

                                
  if (!chat.book_id) {
    return NextResponse.json({ error: 'Chat has no associated book' }, { status: 400 })
  }

  const book = await getBookById(chat.book_id)
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

                            
  const llmStream = sendMessage({
    model: chat.llm_model,
    provider: chat.llm_provider as LLMProvider,
    messages: history,
    extractedText: book.extracted_text,
    apiKey,
  })

                                                                               
                                                                                
  let firstChunk: string | undefined
  try {
    const result = await llmStream.next()
    if (result.done) {
      return NextResponse.json({ error: 'Failed to get a response from the AI provider.' }, { status: 502 })
    }
    firstChunk = result.value
  } catch (err) {
    if (isRateLimitError(err)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Failed to get a response from the AI provider.' }, { status: 502 })
  }

                                                        
  try {
    await addMessage({ chat_id: chatId, role: 'user', content: content.trim() })
  } catch {
    return NextResponse.json({ error: 'Failed to save message. Please try again.' }, { status: 500 })
  }

  let fullResponse = firstChunk ?? ''

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        if (firstChunk !== undefined) {
          controller.enqueue(encoder.encode(firstChunk))
        }
        for await (const chunk of llmStream) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      } finally {
                                                                       
        Promise.all([
          addMessage({ chat_id: chatId, role: 'assistant', content: fullResponse }),
          updateChatLastMessage(chatId),
          isFirstMessage
            ? generateChatTitle(content.trim(), chat.llm_model, apiKey)
                .then((title) => updateChatTitle(chatId, title))
                .catch(() => null)
            : Promise.resolve(),
        ]).catch(console.error)
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
