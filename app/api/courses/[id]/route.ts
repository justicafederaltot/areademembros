import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Forçar rota dinâmica para evitar erro de SSG
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    
    // Buscar o curso
    const courseResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    )
    
    if (courseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }
    
    const course = courseResult.rows[0]
    
    // Buscar as aulas do curso
    const lessonsResult = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    )
    
    const courseWithLessons = {
      ...course,
      lessons: lessonsResult.rows
    }
    
    return NextResponse.json(courseWithLessons)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    console.log('Tentando deletar curso:', courseId)
    
    // Verificar se o curso existe
    const courseResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    )
    
    if (courseResult.rows.length === 0) {
      console.log('Curso não encontrado:', courseId)
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }
    
    console.log('Curso encontrado, deletando aulas...')
    
    // Deletar todas as aulas do curso primeiro (devido à foreign key)
    const lessonsDeleteResult = await pool.query(
      'DELETE FROM lessons WHERE course_id = $1',
      [courseId]
    )
    console.log('Aulas deletadas:', lessonsDeleteResult.rowCount)
    
    // Deletar o curso
    const courseDeleteResult = await pool.query(
      'DELETE FROM courses WHERE id = $1',
      [courseId]
    )
    console.log('Curso deletado:', courseDeleteResult.rowCount)
    
    return NextResponse.json({ message: 'Curso deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
