'use client'

import { useState } from 'react'
import { Course, Attachment } from '@/types'
import LessonAttachments from './LessonAttachments'

interface AdminLessonFormProps {
  courses: Course[]
  selectedCourse: Course | null
  onCourseSelect: (course: Course) => void
  onSaved: () => void
}

export default function AdminLessonForm({ 
  courses, 
  selectedCourse, 
  onCourseSelect, 
  onSaved 
}: AdminLessonFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    order_index: 1
  })
  const [saving, setSaving] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [lessonId, setLessonId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourse) {
      alert('Selecione um curso primeiro')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attachments: attachments
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setLessonId(result.id) // Salvar o ID da aula criada
        
        setFormData({
          title: '',
          description: '',
          video_url: '',
          order_index: 1
        })
        setAttachments([])
        setLessonId(null)
        onSaved()
      } else {
        console.error('Error saving lesson')
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_index' ? parseInt(value) || 1 : value
    }))
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Cadastrar Nova Aula</h3>
      
      {/* Course Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Selecione o Curso
        </label>
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.id === parseInt(e.target.value))
            if (course) onCourseSelect(course)
          }}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Selecione um curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Título da Aula
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: BOAS VINDAS"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrição da aula (opcional)"
            />
          </div>

          <div>
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-2">
              URL do Vídeo (YouTube)
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Cole aqui o link completo do vídeo do YouTube
            </p>
          </div>

          <div>
            <label htmlFor="order_index" className="block text-sm font-medium text-gray-300 mb-2">
              Ordem da Aula
            </label>
            <input
              type="number"
              id="order_index"
              name="order_index"
              value={formData.order_index}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Seção de Anexos - sempre visível durante a criação */}
          <div className="pt-4 border-t border-gray-600">
            <h4 className="text-lg font-semibold text-white mb-4">Anexos da Aula</h4>
            <p className="text-sm text-gray-400 mb-4">
              Adicione arquivos complementares que os alunos poderão baixar (PDFs, documentos, planilhas, etc.)
            </p>
            
            {/* Anexos temporários durante a criação */}
            {attachments.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Anexos preparados ({attachments.length})</h5>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📎</span>
                        <div>
                          <p className="text-sm text-white font-medium">{attachment.original_name}</p>
                          <p className="text-xs text-gray-400">
                            {attachment.file_size} bytes • {attachment.content_type}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newAttachments = attachments.filter((_, i) => i !== index)
                          setAttachments(newAttachments)
                        }}
                        className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input para upload temporário */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adicionar Anexo
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const newAttachment: Attachment = {
                      id: Date.now() + Math.random(), // ID temporário
                      filename: `${Date.now()}_${file.name}`,
                      original_name: file.name,
                      content_type: file.type,
                      file_size: file.size,
                      url: '' // Será preenchido após salvar a aula
                    }
                    setAttachments([...attachments, newAttachment])
                    e.target.value = '' // Limpar o input
                  }
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR (máx. 50MB)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary-500/60 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 backdrop-blur-sm border border-primary-500/30 shadow-lg shadow-primary-500/20"
          >
            {saving ? 'Salvando...' : 'Salvar Aula'}
          </button>
        </form>
      )}

      {/* Seção de Anexos - aparece após salvar a aula para upload real */}
      {lessonId && (
        <div className="mt-8 pt-6 border-t border-gray-600">
          <h4 className="text-lg font-semibold text-white mb-4">Upload de Anexos</h4>
          <p className="text-sm text-gray-400 mb-4">
            Aula criada com sucesso! Agora você pode fazer o upload real dos anexos.
          </p>
          <LessonAttachments
            lessonId={lessonId}
            attachments={[]}
            onAttachmentsChange={() => {}}
          />
        </div>
      )}
    </div>
  )
}
