import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import pool from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const attachmentPath = params.path.join('/')
    console.log('Solicitando anexo:', attachmentPath)

    const attachmentId = parseInt(attachmentPath)

    if (!isNaN(attachmentId)) {
      console.log('Buscando anexo no banco de dados, ID:', attachmentId)
      const result = await pool.query(
        'SELECT * FROM lesson_attachments WHERE id = $1',
        [attachmentId]
      )

      if (result.rows.length === 0) {
        console.log('Anexo não encontrado no banco de dados:', attachmentId)
        return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
      }

      const attachmentData = result.rows[0]
      const fileBuffer = attachmentData.file_data

      const contentType = attachmentData.content_type

      const uint8Array = new Uint8Array(fileBuffer)

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${attachmentData.original_name}"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    } else {
      console.log('Buscando anexo no sistema de arquivos:', attachmentPath)
      const fullPath = join(process.cwd(), 'public', 'uploads', 'attachments', attachmentPath)
      console.log('Caminho completo:', fullPath)

      if (!existsSync(fullPath)) {
        console.log('Arquivo não encontrado:', fullPath)
        return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
      }

      const fileBuffer = await readFile(fullPath)

      // Determinar o Content-Type baseado na extensão
      const ext = attachmentPath.split('.').pop()?.toLowerCase()
      let contentType = 'application/octet-stream'

      if (ext === 'pdf') {
        contentType = 'application/pdf'
      } else if (ext === 'doc') {
        contentType = 'application/msword'
      } else if (ext === 'docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (ext === 'xls') {
        contentType = 'application/vnd.ms-excel'
      } else if (ext === 'xlsx') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      } else if (ext === 'ppt') {
        contentType = 'application/vnd.ms-powerpoint'
      } else if (ext === 'pptx') {
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      } else if (ext === 'txt') {
        contentType = 'text/plain'
      } else if (ext === 'csv') {
        contentType = 'text/csv'
      } else if (ext === 'zip') {
        contentType = 'application/zip'
      } else if (ext === 'rar') {
        contentType = 'application/x-rar-compressed'
      }

      const uint8Array = new Uint8Array(fileBuffer)

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${attachmentPath}"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }
  } catch (error) {
    console.error('Erro ao servir anexo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const attachmentPath = params.path.join('/')
    const attachmentId = parseInt(attachmentPath)

    if (isNaN(attachmentId)) {
      return NextResponse.json({ error: 'ID do anexo inválido' }, { status: 400 })
    }

    console.log('Tentando deletar anexo:', attachmentId)

    // Verificar se o anexo existe
    const result = await pool.query(
      'SELECT * FROM lesson_attachments WHERE id = $1',
      [attachmentId]
    )

    if (result.rows.length === 0) {
      console.log('Anexo não encontrado:', attachmentId)
      return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
    }

    const attachment = result.rows[0]

    // Deletar o anexo do banco de dados
    await pool.query(
      'DELETE FROM lesson_attachments WHERE id = $1',
      [attachmentId]
    )

    // Atualizar o campo attachments na tabela lessons
    const lessonResult = await pool.query(
      'SELECT * FROM lessons WHERE id = $1',
      [attachment.lesson_id]
    )

    if (lessonResult.rows.length > 0) {
      const lesson = lessonResult.rows[0]
      const currentAttachments = lesson.attachments || []
      const updatedAttachments = currentAttachments.filter((att: any) => att.id !== attachmentId)

      await pool.query(
        'UPDATE lessons SET attachments = $1 WHERE id = $2',
        [JSON.stringify(updatedAttachments), attachment.lesson_id]
      )
    }

    console.log('Anexo deletado com sucesso:', attachmentId)
    return NextResponse.json({ message: 'Anexo deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar anexo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
