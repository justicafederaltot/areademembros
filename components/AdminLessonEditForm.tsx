'use client'

import { useState, useEffect } from 'react'
import { Lesson, Course, Attachment } from '@/types'
import LessonAttachments from './LessonAttachments'

interface AdminLessonEditFormProps {
  lesson: Lesson | null
  courses: Course[]
  onSaved: () => void
  onCancel: () => void
}

export default function AdminLessonEditForm({ lesson, courses, onSaved, onCancel }: AdminLessonEditFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    order_index: 1
  })
  const [saving, setSaving] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Carregar dados da aula quando o componente receber uma aula
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.video_url,
        order_index: lesson.order_index
      })
      setAttachments(lesson.attachments || [])
    }
  }, [lesson])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!lesson) return
    
    console.log('Atualizando aula com dados:', formData)
    setSaving(true)

    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PUT',
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
        console.log('Aula atualizada com sucesso:', result)
        alert('Aula atualizada com sucesso!')
        onSaved()
      } else {
        const error = await response.json()
        console.error('Erro ao atualizar aula:', error)
        alert(`Erro ao atualizar aula: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar aula:', error)
      alert('Erro ao atualizar aula')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_index' ? parseInt(value) : value
    }))
  }

  if (!lesson) {
    return null
  }

  // Encontrar o curso da aula
  const course = courses.find(c => c.id === lesson.course_id)

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Editar Aula</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Curso
          </label>
          <input
            type="text"
            value={course?.title || 'Curso não encontrado'}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
          />
        </div>

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
            placeholder="Ex: Introdução ao Sistema"
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
            required
            rows={3}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Nesta aula você aprenderá os conceitos básicos..."
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

        {/* Gerenciamento de Anexos */}
        <LessonAttachments
          lessonId={lesson.id}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-primary-500/60 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 backdrop-blur-sm border border-primary-500/30 shadow-lg shadow-primary-500/20"
          >
            {saving ? 'Salvando...' : 'Atualizar Aula'}
          </button>
        </div>
      </form>
    </div>
  )
}
