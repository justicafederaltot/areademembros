import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Forçar rota dinâmica para evitar erro de SSG
export const dynamic = 'force-dynamic'

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
