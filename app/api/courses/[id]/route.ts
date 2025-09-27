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
    
    // Buscar o curso
    const courseResult = await query('SELECT * FROM courses WHERE id = $1', [courseId])
    const course = courseResult.rows[0]
    
    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }
    
    // Buscar as aulas do curso
    const lessonsResult = await query(
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const { title, description, image_url, category } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Título, descrição e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const db = new Database('database.sqlite')
    
    // Verificar se o curso existe
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId)
    
    if (!course) {
      db.close()
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    // Atualizar o curso
    db.prepare(
      'UPDATE courses SET title = ?, description = ?, image_url = ?, category = ? WHERE id = ?'
    ).run(title, description, image_url, category, courseId)

    const updatedCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId)
    db.close()

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
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
    const courseId = parseInt(params.id)
    console.log('Tentando deletar curso:', courseId)
    
    const db = new Database('database.sqlite')
    
    // Verificar se o curso existe
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId)
    
    if (!course) {
      console.log('Curso não encontrado:', courseId)
      db.close()
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }
    
    console.log('Curso encontrado, deletando aulas...')
    
    // Deletar todas as aulas do curso primeiro (devido à foreign key)
    const lessonsDeleteResult = db.prepare('DELETE FROM lessons WHERE course_id = ?').run(courseId)
    console.log('Aulas deletadas:', lessonsDeleteResult.changes)
    
    // Deletar o curso
    const courseDeleteResult = db.prepare('DELETE FROM courses WHERE id = ?').run(courseId)
    console.log('Curso deletado:', courseDeleteResult.changes)
    
    db.close()
    return NextResponse.json({ message: 'Curso deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
