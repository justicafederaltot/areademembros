import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

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
    const lessonResult = await pool.query(
      'SELECT * FROM lessons WHERE id = $1',
      [lessonId]
    )
    
    if (lessonResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Atualizar a aula
    const result = await pool.query(
      'UPDATE lessons SET title = $1, description = $2, video_url = $3, order_index = $4, attachments = $5 WHERE id = $6 RETURNING *',
      [title, description, video_url, order_index, JSON.stringify(attachments || []), lessonId]
    )

    return NextResponse.json(result.rows[0])
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
    const lessonResult = await pool.query(
      'SELECT * FROM lessons WHERE id = $1',
      [lessonId]
    )
    
    if (lessonResult.rows.length === 0) {
      console.log('Aula não encontrada:', lessonId)
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }
    
    console.log('Aula encontrada, deletando...')
    
    // Deletar a aula
    const deleteResult = await pool.query(
      'DELETE FROM lessons WHERE id = $1',
      [lessonId]
    )
    console.log('Aula deletada:', deleteResult.rowCount)
    
    return NextResponse.json({ message: 'Aula deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
