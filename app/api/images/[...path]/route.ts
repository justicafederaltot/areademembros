import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    const fullPath = join(process.cwd(), 'public', 'uploads', imagePath)
    
    console.log('Solicitando imagem:', imagePath)
    console.log('Caminho completo:', fullPath)
    
    if (!existsSync(fullPath)) {
      console.log('Arquivo não encontrado:', fullPath)
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
    }
    
    const imageBuffer = await readFile(fullPath)
    
    // Determinar o tipo MIME baseado na extensão
    const ext = imagePath.split('.').pop()?.toLowerCase()
    let contentType = 'image/png'
    
    if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg'
    } else if (ext === 'gif') {
      contentType = 'image/gif'
    } else if (ext === 'webp') {
      contentType = 'image/webp'
    }
    
    // Converter Buffer para Uint8Array para compatibilidade com NextResponse
    const uint8Array = new Uint8Array(imageBuffer)
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
    
  } catch (error) {
    console.error('Erro ao servir imagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
