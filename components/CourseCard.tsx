'use client'

import { Course } from '@/types'
import { Lock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const [imageError, setImageError] = useState(false)

  // Reset imageError when course.image_url changes
  useEffect(() => {
    setImageError(false)
  }, [course.image_url])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/course/${course.id}`
  }

  const handleImageError = () => {
    console.log('Image failed to load:', course.image_url)
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', course.image_url)
    setImageError(false)
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-black border border-gray-700 rounded-lg overflow-hidden hover:border-primary-500 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-700">
        {course.image_url && !imageError ? (
          <img 
            src={course.image_url} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <span className="text-gray-400 text-sm">{course.title}</span>
              {course.image_url && (
                <div className="text-xs text-red-400 mt-1">
                  Erro ao carregar: {course.image_url}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Lock Icon */}
        <div className="absolute top-3 right-3">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-primary-500/60 to-primary-700/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-primary-500/30 shadow-md shadow-primary-500/20">
            {course.category === 'jef' ? 'JEF' : 'VARA'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {course.description}
        </p>
      </div>
    </div>
  )
}
