                                               
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteBook } from '@/features/ai-assistant/chatService'

type Params = { params: { bookId: string } }
                                                                                                 
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { bookId } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })                                                                            
  const { data: book } = await supabase
    .from('ai_books')
    .select('id, user_id')
    .eq('id', bookId)
    .single()
  if (!book || book.user_id !== user.id) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  await deleteBook(bookId, user.id)
  return NextResponse.json({ success: true })
}
