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
    
    // Verificar se tem imagem
    if (!formData.image_url) {
      alert('Por favor, selecione uma imagem para o curso!')
      return
    }
    
    console.log('Enviando curso com dados:', formData)
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
        const result = await response.json()
        console.log('Curso criado com sucesso:', result)
        
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
        const error = await response.json()
        console.error('Erro ao salvar curso:', error)
        alert(`Erro ao salvar curso: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
      alert('Erro ao salvar curso')
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Arquivo selecionado:', file.name, file.size, file.type)
      setSelectedFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Fazer upload automático da imagem
      await handleUpload(file)
    }
  }

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile
    if (!fileToUpload) return

    console.log('Iniciando upload do arquivo:', fileToUpload.name)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', fileToUpload)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload bem-sucedido:', data)
        setFormData(prev => ({
          ...prev,
          image_url: data.imageUrl
        }))
        console.log('Imagem enviada com sucesso:', data.imageUrl)
      } else {
        const error = await response.json()
        console.error('Erro no upload:', error)
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
            Imagem do Curso *
          </label>
          
          {/* Input de arquivo */}
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileSelect}
            required
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
            {uploading && (
              <span className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md">
                Enviando imagem...
              </span>
            )}
            
            {formData.image_url && (
              <span className="px-4 py-2 bg-green-500 text-white text-sm rounded-md">
                ✓ Imagem carregada
              </span>
            )}
            
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
          disabled={saving || !formData.image_url}
          className="w-full bg-gradient-to-r from-primary-500/60 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 backdrop-blur-sm border border-primary-500/30 shadow-lg shadow-primary-500/20"
        >
          {saving ? 'Salvando...' : 'Salvar Curso'}
        </button>
      </form>
    </div>
  )
}
