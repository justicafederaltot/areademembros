'use client'

import { useState, useRef } from 'react'
import { Attachment } from '@/types'

interface LessonAttachmentsProps {
  lessonId: number
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
}

export default function LessonAttachments({ 
  lessonId, 
  attachments, 
  onAttachmentsChange 
}: LessonAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('Anexo selecionado:', file.name, file.size, file.type)
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
        const data = await response.json()
        console.log('Anexo enviado com sucesso:', data)
        
        // Adicionar o novo anexo à lista
        const newAttachments = [...attachments, data.attachment]
        onAttachmentsChange(newAttachments)
        
        // Limpar o input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        alert('Anexo enviado com sucesso!')
      } else {
        const error = await response.json()
        console.error('Erro no upload:', error)
        alert(`Erro ao enviar anexo: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao enviar anexo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) {
      return
    }

    setDeleting(attachmentId)

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover o anexo da lista
        const updatedAttachments = attachments.filter(att => att.id !== attachmentId)
        onAttachmentsChange(updatedAttachments)
        alert('Anexo excluído com sucesso!')
      } else {
        const error = await response.json()
        console.error('Erro ao excluir anexo:', error)
        alert(`Erro ao excluir anexo: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir anexo:', error)
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
    if (contentType.includes('word')) return '📝'
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊'
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈'
    if (contentType.includes('text')) return '📄'
    if (contentType.includes('zip') || contentType.includes('rar')) return '📦'
    return '📎'
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Anexos da Aula
        </label>
        
        {/* Input para upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
        />
        
        <p className="text-xs text-gray-400 mt-1">
          Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR (máx. 50MB)
        </p>
        
        {uploading && (
          <div className="mt-2">
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md">
              Enviando anexo...
            </span>
          </div>
        )}
      </div>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Anexos ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(attachment.content_type)}</span>
                  <div>
                    <p className="text-sm text-white font-medium">{attachment.original_name}</p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(attachment.file_size)} • {attachment.content_type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={attachment.url}
                    download={attachment.original_name}
                    className="text-xs text-blue-500 hover:text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/10"
                  >
                    Baixar
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    disabled={deleting === attachment.id}
                    className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deleting === attachment.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">Nenhum anexo adicionado ainda</p>
          <p className="text-xs mt-1">Clique em "Escolher arquivo" para adicionar anexos</p>
        </div>
      )}
    </div>
  )
}
