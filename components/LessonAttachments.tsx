'use client'
import { useState, useRef } from 'react'
import { Attachment } from '@/types'

interface LessonAttachmentsProps {
  lessonId: number
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
}

interface LessonAttachmentsDisplayProps {
  attachments: Attachment[]
}

export default function LessonAttachments({ lessonId, attachments, onAttachmentsChange }: LessonAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
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
      alert('Tipo de arquivo não permitido. Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR')
      return
    }

    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 50MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lessonId', lessonId.toString())

      const response = await fetch('/api/upload/attachment', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onAttachmentsChange([...attachments, result.attachment])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = await response.json()
        alert(`Erro ao fazer upload: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading attachment:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) return

    setDeleting(attachmentId)

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onAttachmentsChange(attachments.filter(a => a.id !== attachmentId))
      } else {
        alert('Erro ao excluir anexo')
      }
    } catch (error) {
      console.error('Error deleting attachment:', error)
      alert('Erro ao excluir anexo')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄'
    if (contentType.includes('word') || contentType.includes('document')) return '📝'
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊'
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈'
    if (contentType.includes('text')) return '📄'
    if (contentType.includes('zip') || contentType.includes('rar')) return '📦'
    return '📎'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Anexos da Aula</h4>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          {uploading ? 'Enviando...' : '+ Adicionar Anexo'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
        className="hidden"
      />

      {attachments.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum anexo adicionado</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(attachment.content_type)}</span>
                <div>
                  <p className="text-white font-medium">{attachment.original_name}</p>
                  <p className="text-gray-400 text-sm">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={attachment.url}
                  download={attachment.original_name}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  disabled={deleting === attachment.id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  {deleting === attachment.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para exibição apenas (sem edição)
export function LessonAttachmentsDisplay({ attachments }: LessonAttachmentsDisplayProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄'
    if (contentType.includes('word') || contentType.includes('document')) return '📝'
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊'
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈'
    if (contentType.includes('text')) return '📄'
    if (contentType.includes('zip') || contentType.includes('rar')) return '📦'
    return '📎'
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">📎</span>
        Anexos da Aula
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <span className="text-2xl mr-3">{getFileIcon(attachment.content_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate" title={attachment.original_name}>
                {attachment.original_name}
              </p>
              <p className="text-gray-400 text-sm">{formatFileSize(attachment.file_size)}</p>
            </div>
            <a
              href={attachment.url}
              download={attachment.original_name}
              className="ml-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-sm transition-colors whitespace-nowrap"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
