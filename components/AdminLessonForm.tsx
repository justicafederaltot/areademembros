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

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary-500/60 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 backdrop-blur-sm border border-primary-500/30 shadow-lg shadow-primary-500/20"
          >
            {saving ? 'Salvando...' : 'Salvar Aula'}
          </button>
        </form>
      )}

      {/* Seção de Anexos - aparece após salvar a aula */}
      {lessonId && (
        <div className="mt-8 pt-6 border-t border-gray-600">
          <h4 className="text-lg font-semibold text-white mb-4">Anexos da Aula</h4>
          <p className="text-sm text-gray-400 mb-4">
            Aula criada com sucesso! Agora você pode adicionar anexos para download.
          </p>
          <LessonAttachments
            lessonId={lessonId}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>
      )}
    </div>
  )
}
