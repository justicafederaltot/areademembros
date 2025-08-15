import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import pool from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'ID da aula é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe progresso para esta aula
    const existingProgress = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [decoded.userId, lessonId]
    )

    if (existingProgress.rows.length > 0) {
      // Atualizar progresso existente
      await pool.query(
        'UPDATE user_progress SET completed = true, completed_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND lesson_id = $2',
        [decoded.userId, lessonId]
      )
    } else {
      // Criar novo progresso
      await pool.query(
        'INSERT INTO user_progress (user_id, lesson_id, completed, completed_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP)',
        [decoded.userId, lessonId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
