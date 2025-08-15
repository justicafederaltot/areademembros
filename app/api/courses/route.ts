import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, image_url, category } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Título, descrição e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, image_url, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, image_url, category]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
