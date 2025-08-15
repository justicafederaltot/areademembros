'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Header from '@/components/Header'
import VideoPlayer from '@/components/VideoPlayer'
import LessonList from '@/components/LessonList'
import { CourseWithLessons, LessonWithProgress } from '@/types'

export default function CoursePage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<CourseWithLessons | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<LessonWithProgress | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)

  useEffect(() => {
    if (user && courseId) {
      fetchCourse()
    }
  }, [user, courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        if (data.lessons.length > 0) {
          setSelectedLesson(data.lessons[0])
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoadingCourse(false)
    }
  }

  const markLessonAsCompleted = async (lessonId: number) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })

      if (response.ok) {
        // Atualizar o estado local
        if (course && selectedLesson) {
          const updatedLessons = course.lessons.map(lesson => 
            lesson.id === lessonId 
              ? { ...lesson, progress: { ...lesson.progress, completed: true } }
              : lesson
          )
          setCourse({ ...course, lessons: updatedLessons })
          setSelectedLesson(prev => prev ? { ...prev, progress: { ...prev.progress, completed: true } } : null)
        }
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    }
  }

  if (loading || loadingCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-400">Faça login para acessar a área de membros.</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Curso não encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="flex h-[calc(100vh-64px)]">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-black border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {selectedLesson?.title || course.title}
                </h1>
                <nav className="text-sm text-gray-400 mt-1">
                  Início &gt; {course.title}
                </nav>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 p-4">
            {selectedLesson ? (
              <VideoPlayer 
                videoUrl={selectedLesson.video_url}
                lessonId={selectedLesson.id}
                onComplete={() => markLessonAsCompleted(selectedLesson.id)}
              />
            ) : (
                              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Selecione uma aula para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Lesson List Sidebar */}
        <div className="w-80 bg-black border-l border-gray-700">
          <LessonList 
            course={course}
            selectedLesson={selectedLesson}
            onSelectLesson={setSelectedLesson}
          />
        </div>
      </main>
    </div>
  )
}
