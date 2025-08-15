import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    console.log('Diretório de upload:', uploadDir)
    
    if (!existsSync(uploadDir)) {
      console.log('Criando diretório de upload...')
      await mkdir(uploadDir, { recursive: true })
    }

    // Usar apenas o nome original do arquivo (sem timestamp)
    const fileName = file.name
    const filePath = join(uploadDir, fileName)
    
    console.log('Salvando arquivo em:', filePath)

    // Converter arquivo para buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Verificar se o arquivo foi salvo
    if (!existsSync(filePath)) {
      console.log('Erro: Arquivo não foi salvo')
      return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 })
    }

    // Retornar URL da imagem
    const imageUrl = `/uploads/${fileName}`
    console.log('Upload concluído:', imageUrl)

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Imagem enviada com sucesso' 
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
