import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { query } from '@/lib/database'

// Forçar rota dinâmica para evitar erro de SSG
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando upload...')
    
    // Verificar se o Content-Type está correto
    const contentType = request.headers.get('content-type')
    console.log('Content-Type recebido:', contentType)
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log('Content-Type inválido:', contentType)
      return NextResponse.json({ 
        error: 'Content-Type deve ser multipart/form-data',
        received: contentType 
      }, { status: 400 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('Nenhum arquivo enviado')
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    console.log('Arquivo recebido:', file.name, file.size, file.type)

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      console.log('Tipo de arquivo inválido:', file.type)
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('Arquivo muito grande:', file.size)
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    
    // Verificar se estamos em produção (Render)
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction) {
      // Em produção, salvar apenas no banco de dados
      console.log('Ambiente de produção detectado - salvando no banco de dados')
      
      // Salvar informações da imagem no banco de dados
      const result = await query(
        'INSERT INTO uploaded_images (filename, original_name, content_type, file_size, file_data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [fileName, file.name, file.type, file.size, buffer]
      )
      
      const imageId = result.rows[0].id
      const imageUrl = `/api/images/${imageId}`
      
      console.log('Upload concluído (produção):', imageUrl)
      
      return NextResponse.json({ 
        success: true, 
        imageUrl,
        message: 'Imagem enviada com sucesso' 
      })
      
    } else {
      // Em desenvolvimento, salvar no sistema de arquivos
      console.log('Ambiente de desenvolvimento detectado - salvando no sistema de arquivos')
      
      // Criar diretório se não existir
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      console.log('Diretório de upload:', uploadDir)
      
      if (!existsSync(uploadDir)) {
        console.log('Criando diretório de upload...')
        await mkdir(uploadDir, { recursive: true })
      }

      const filePath = join(uploadDir, fileName)
      console.log('Salvando arquivo em:', filePath)

      // Salvar arquivo
      await writeFile(filePath, buffer)

      // Verificar se o arquivo foi salvo
      if (!existsSync(filePath)) {
        console.log('Erro: Arquivo não foi salvo')
        return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 })
      }

      // Retornar URL da imagem usando a API route
      const imageUrl = `/api/images/${fileName}`
      console.log('Upload concluído (desenvolvimento):', imageUrl)

      return NextResponse.json({ 
        success: true, 
        imageUrl,
        message: 'Imagem enviada com sucesso' 
      })
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
