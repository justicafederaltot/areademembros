import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Forçar rota dinâmica para evitar erro de SSG
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'ID do curso inválido' },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const { title, description, video_url, order_index, attachments } = await request.json()

    if (!title || !video_url) {
      return NextResponse.json(
        { error: 'Título e URL do vídeo são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await query(
      'INSERT INTO lessons (course_id, title, description, video_url, order_index, attachments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [courseId, title, description, video_url, order_index || 1, JSON.stringify(attachments || [])]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
