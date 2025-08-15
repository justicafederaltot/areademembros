'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Header from '@/components/Header'
import Banner from '@/components/Banner'
import CourseSection from '@/components/CourseSection'
import LoginForm from '@/components/LoginForm'
import { Course } from '@/types'

export default function Home() {
  const { user, loading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  if (loading) {
    return (
              <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const jefCourses = courses.filter(course => course.category === 'jef')
  const varaCourses = courses.filter(course => course.category === 'vara')

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        <Banner />
        
        <div className="container mx-auto px-4 py-8">
          {loadingCourses ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
                      {jefCourses.length > 0 && (
          <CourseSection
            title="Tutoriais JEF-TOT"
            courses={jefCourses}
          />
        )}

        {varaCourses.length > 0 && (
          <CourseSection
            title="Tutoriais VARA"
            courses={varaCourses}
          />
        )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
