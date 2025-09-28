import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/database'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resetando banco de dados completamente...')
    
    // 1. Limpar todas as tabelas
    console.log('🗑️ Limpando tabelas...')
    await query('DELETE FROM user_progress')
    await query('DELETE FROM lesson_attachments')
    await query('DELETE FROM uploaded_images')
    await query('DELETE FROM lessons')
    await query('DELETE FROM courses')
    await query('DELETE FROM users')
    
    console.log('✅ Tabelas limpas')
    
    // 2. Recriar usuário admin com senha simples
    console.log('👤 Criando usuário admin...')
    const adminPassword = '123456' // Senha mais simples
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const adminResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      ['admin@jus.com', hashedPassword, 'Administrador', 'admin']
    )
    
    const adminUser = adminResult.rows[0]
    console.log('✅ Usuário admin criado:', adminUser.email)
    
    // 3. Criar usuário alternativo
    console.log('👤 Criando usuário alternativo...')
    const altPassword = 'admin123'
    const altHashedPassword = await bcrypt.hash(altPassword, 10)
    
    const altResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      ['admin@destrava.com', altHashedPassword, 'Admin Destrava', 'admin']
    )
    
    const altUser = altResult.rows[0]
    console.log('✅ Usuário alternativo criado:', altUser.email)
    
    // 4. Criar curso de exemplo
    console.log('📚 Criando curso de exemplo...')
    const courseResult = await query(
      'INSERT INTO courses (title, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Curso de Teste', 'Curso criado automaticamente para teste', 'jef', '/images/banner/BANNER1.png']
    )
    
    const courseId = courseResult.rows[0].id
    console.log('✅ Curso criado:', courseId)
    
    // 5. Criar aula de exemplo
    console.log('📹 Criando aula de exemplo...')
    await query(
      'INSERT INTO lessons (course_id, title, description, video_url, order_index) VALUES ($1, $2, $3, $4, $5)',
      [courseId, 'Aula de Teste', 'Aula criada automaticamente para teste', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1]
    )
    
    console.log('✅ Aula criada')
    
    const credentials = [
      {
        email: 'admin@jus.com',
        password: '123456',
        description: 'Usuário admin principal (senha simples)'
      },
      {
        email: 'admin@destrava.com', 
        password: 'admin123',
        description: 'Usuário admin alternativo'
      }
    ]
    
    console.log('🎉 Reset do banco concluído com sucesso!')
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados resetado com sucesso',
      credentials: credentials,
      summary: {
        users_created: 2,
        courses_created: 1,
        lessons_created: 1,
        tables_cleared: 6
      },
      instructions: [
        '1. Tente fazer login com as credenciais acima',
        '2. Use preferencialmente: admin@jus.com / 123456',
        '3. Se não funcionar, use: admin@destrava.com / admin123',
        '4. Verifique o diagnóstico completo se ainda houver problemas'
      ]
    })
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao resetar banco de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
