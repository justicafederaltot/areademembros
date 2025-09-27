import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { query } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando upload de anexo...')
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
    const lessonId = formData.get('lessonId') as string

    if (!file) {
      console.log('Nenhum arquivo enviado')
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!lessonId) {
      console.log('ID da aula não fornecido')
      return NextResponse.json({ error: 'ID da aula é obrigatório' }, { status: 400 })
    }

    console.log('Arquivo recebido:', file.name, file.size, file.type)
    console.log('ID da aula:', lessonId)

    // Verificar se a aula existe
    const lessonResult = await query(
      'SELECT * FROM lessons WHERE id = $1',
      [parseInt(lessonId)]
    )

    if (lessonResult.rows.length === 0) {
      console.log('Aula não encontrada:', lessonId)
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Validar tipo de arquivo (permitir documentos, PDFs, planilhas, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed'
    ]

    if (!allowedTypes.includes(file.type)) {
      console.log('Tipo de arquivo não permitido:', file.type)
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR' 
      }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      console.log('Arquivo muito grande:', file.size)
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 50MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`

    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) {
      console.log('Ambiente de produção detectado - salvando anexo no banco de dados')
      
      try {
        // Salvar anexo na tabela lesson_attachments
        const result = await query(
          'INSERT INTO lesson_attachments (lesson_id, filename, original_name, content_type, file_size, file_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [parseInt(lessonId), fileName, file.name, file.type, file.size, buffer]
        )
        
        const attachmentId = result.rows[0].id
        const attachmentUrl = `/api/attachments/${attachmentId}`
        
        // Atualizar o campo attachments na tabela lessons
        const lesson = lessonResult.rows[0]
        const currentAttachments = lesson.attachments || []
        const newAttachment = {
          id: attachmentId,
          filename: fileName,
          original_name: file.name,
          content_type: file.type,
          file_size: file.size,
          url: attachmentUrl
        }
        
        const updatedAttachments = [...currentAttachments, newAttachment]
        
        await query(
          'UPDATE lessons SET attachments = $1 WHERE id = $2',
          [JSON.stringify(updatedAttachments), parseInt(lessonId)]
        )
        
        console.log('Anexo enviado com sucesso (produção):', attachmentUrl)
        return NextResponse.json({
          success: true,
          attachment: newAttachment,
          message: 'Anexo enviado com sucesso'
        })
      } catch (dbError) {
        console.error('Erro ao salvar anexo no banco de dados:', dbError)
        return NextResponse.json({
          error: 'Erro ao salvar anexo no banco de dados',
          details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
        }, { status: 500 })
      }
    } else {
      console.log('Ambiente de desenvolvimento detectado - salvando anexo no sistema de arquivos')
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'attachments')
      console.log('Diretório de upload de anexos:', uploadDir)

      if (!existsSync(uploadDir)) {
        console.log('Criando diretório de upload de anexos...')
        await mkdir(uploadDir, { recursive: true })
      }

      const filePath = join(uploadDir, fileName)
      console.log('Salvando anexo em:', filePath)
      await writeFile(filePath, buffer)

      if (!existsSync(filePath)) {
        console.log('Erro: Anexo não foi salvo')
        return NextResponse.json({ error: 'Erro ao salvar anexo' }, { status: 500 })
      }

      const attachmentUrl = `/api/attachments/${fileName}`
      
      // Atualizar o campo attachments na tabela lessons
      const lesson = lessonResult.rows[0]
      const currentAttachments = lesson.attachments || []
      const newAttachment = {
        id: Date.now(), // ID temporário para desenvolvimento
        filename: fileName,
        original_name: file.name,
        content_type: file.type,
        file_size: file.size,
        url: attachmentUrl
      }
      
      const updatedAttachments = [...currentAttachments, newAttachment]
      
      await query(
        'UPDATE lessons SET attachments = $1 WHERE id = $2',
        [JSON.stringify(updatedAttachments), parseInt(lessonId)]
      )

      console.log('Anexo enviado com sucesso (desenvolvimento):', attachmentUrl)
      return NextResponse.json({
        success: true,
        attachment: newAttachment,
        message: 'Anexo enviado com sucesso'
      })
    }
  } catch (error) {
    console.error('Erro no upload de anexo:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
