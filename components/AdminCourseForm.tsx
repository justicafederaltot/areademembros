'use client'

import { useState, useRef } from 'react'

interface AdminCourseFormProps {
  onSaved: () => void
}

export default function AdminCourseForm({ onSaved }: AdminCourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'jef'
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          image_url: '',
          category: 'jef'
        })
        setSelectedFile(null)
        setPreviewUrl('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onSaved()
      } else {
        console.error('Error saving course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          image_url: data.imageUrl
        }))
        alert('Imagem enviada com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro ao enviar imagem: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Cadastrar Novo Curso</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Título do Curso
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: BASE DE OPERAÇÃO"
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
            placeholder="Ex: Configure a Estrutura de Anunciante Profissional"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            Imagem do Curso
          </label>
          
          {/* Input de arquivo */}
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          {/* Preview da imagem */}
          {previewUrl && (
            <div className="mt-4">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-md border border-gray-600"
              />
            </div>
          )}
          
          {/* URL da imagem (após upload) */}
          {formData.image_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-400">URL da imagem: {formData.image_url}</p>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white text-sm font-semibold rounded-md transition-colors"
            >
              {uploading ? 'Enviando...' : 'Enviar Imagem'}
            </button>
            
            {(selectedFile || formData.image_url) && (
              <button
                type="button"
                onClick={clearImage}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="jef">JEF</option>
            <option value="vara">VARA</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
                     className="w-full bg-gradient-to-r from-primary-500/60 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 backdrop-blur-sm border border-primary-500/30 shadow-lg shadow-primary-500/20"
        >
          {saving ? 'Salvando...' : 'Salvar Curso'}
        </button>
      </form>
    </div>
  )
}
