import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Forçar rota dinâmica para evitar erro de SSG
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)
    const { title, description, video_url, order_index, attachments } = await request.json()

    if (!title || !description || !video_url || !order_index) {
      return NextResponse.json(
        { error: 'Título, descrição, URL do vídeo e ordem são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a aula existe
    const lessonResult = await query('SELECT * FROM lessons WHERE id = $1', [lessonId])
    
    if (lessonResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Atualizar a aula
    const result = await query(
      'UPDATE lessons SET title = $1, description = $2, video_url = $3, order_index = $4, attachments = $5 WHERE id = $6 RETURNING *',
      [title, description, video_url, order_index, JSON.stringify(attachments || []), lessonId]
    )

    // Parsear attachments de string JSON para array
    const lesson = result.rows[0]
    lesson.attachments = typeof lesson.attachments === 'string' 
      ? JSON.parse(lesson.attachments) 
      : (lesson.attachments || [])

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)
    console.log('Tentando deletar aula:', lessonId)
    
    // Verificar se a aula existe
    const lessonResult = await query('SELECT * FROM lessons WHERE id = $1', [lessonId])
    
    if (lessonResult.rows.length === 0) {
      console.log('Aula não encontrada:', lessonId)
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }
    
    console.log('Aula encontrada, deletando...')
    
    // Deletar a aula
    const result = await query('DELETE FROM lessons WHERE id = $1', [lessonId])
    console.log('Aula deletada com sucesso')
    
    return NextResponse.json({ message: 'Aula deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
