'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Header from '@/components/Header'
import AdminCourseForm from '@/components/AdminCourseForm'
import AdminCourseEditForm from '@/components/AdminCourseEditForm'
import AdminLessonForm from '@/components/AdminLessonForm'
import AdminLessonEditForm from '@/components/AdminLessonEditForm'
import { Course, Lesson } from '@/types'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons'>('courses')
  
  // Estados para edição
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCourses()
    }
  }, [user])

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchLessons = async (courseId: number) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  const handleCourseSaved = () => {
    fetchCourses()
    setEditingCourse(null)
  }

  const handleLessonSaved = () => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id)
    }
    setEditingLesson(null)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setActiveTab('courses')
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setActiveTab('lessons')
  }

  const handleCancelEdit = () => {
    setEditingCourse(null)
    setEditingLesson(null)
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('Tem certeza que deseja excluir este curso? Todas as aulas associadas também serão excluídas.')) {
      try {
        console.log('Deletando curso:', courseId)
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE',
        })
        
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('Curso deletado:', result)
          alert('Curso excluído com sucesso!')
          fetchCourses()
          if (selectedCourse?.id === courseId) {
            setSelectedCourse(null)
            setLessons([])
          }
        } else {
          const errorData = await response.json()
          console.error('Erro na resposta:', errorData)
          alert(`Erro ao excluir o curso: ${errorData.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Erro ao excluir o curso: ' + error)
      }
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      try {
        console.log('Deletando aula:', lessonId)
        const response = await fetch(`/api/lessons/${lessonId}`, {
          method: 'DELETE',
        })
        
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('Aula deletada:', result)
          alert('Aula excluída com sucesso!')
          if (selectedCourse) {
            fetchLessons(selectedCourse.id)
          }
        } else {
          const errorData = await response.json()
          console.error('Erro na resposta:', errorData)
          alert(`Erro ao excluir a aula: ${errorData.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('Error deleting lesson:', error)
        alert('Erro ao excluir a aula: ' + error)
      }
    }
  }

  if (loading) {
          return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400">Gerencie cursos e aulas da plataforma</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-black rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'courses'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cursos
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'lessons'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aulas
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-black rounded-lg p-6">
            {activeTab === 'courses' ? (
              editingCourse ? (
                <AdminCourseEditForm 
                  course={editingCourse}
                  onSaved={handleCourseSaved}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <AdminCourseForm onSaved={handleCourseSaved} />
              )
            ) : (
              editingLesson ? (
                <AdminLessonEditForm 
                  lesson={editingLesson}
                  courses={courses}
                  onSaved={handleLessonSaved}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <AdminLessonForm 
                  courses={courses}
                  selectedCourse={selectedCourse}
                  onCourseSelect={setSelectedCourse}
                  onSaved={handleLessonSaved}
                />
              )
            )}
          </div>

          {/* List Section */}
          <div className="bg-black rounded-lg p-6">
            {activeTab === 'courses' ? (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Cursos Cadastrados</h3>
                <div className="space-y-3">
                  {courses.map((course) => (
                                          <div
                        key={course.id}
                        className="p-4 bg-gray-900 rounded-lg border border-gray-600"
                      >
                      <h4 className="font-medium text-white">{course.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{course.category}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-xs text-blue-500 hover:text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/10"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourse(course)
                              setActiveTab('lessons')
                            }}
                            className="text-xs text-primary-500 hover:text-primary-400"
                          >
                            Gerenciar Aulas
                          </button>
                                                     <button
                             onClick={(e) => {
                               e.preventDefault()
                               e.stopPropagation()
                               handleDeleteCourse(course.id)
                             }}
                             className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10"
                           >
                             Excluir
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Aulas do Curso: {selectedCourse?.title || 'Selecione um curso'}
                </h3>
                {selectedCourse ? (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                                             <div
                         key={lesson.id}
                         className="p-4 bg-gray-900 rounded-lg border border-gray-600"
                       >
                        <h4 className="font-medium text-white">{lesson.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Ordem: {lesson.order_index}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditLesson(lesson)}
                              className="text-xs text-blue-500 hover:text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/10"
                            >
                              Editar
                            </button>
                                                     <button
                             onClick={(e) => {
                               e.preventDefault()
                               e.stopPropagation()
                               handleDeleteLesson(lesson.id)
                             }}
                             className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10"
                           >
                             Excluir
                           </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Selecione um curso para ver suas aulas</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
