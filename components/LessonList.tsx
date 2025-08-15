'use client'

import { CourseWithLessons, LessonWithProgress } from '@/types'
import { CheckCircle, Circle, Play } from 'lucide-react'

interface LessonListProps {
  course: CourseWithLessons
  selectedLesson: LessonWithProgress | null
  onSelectLesson: (lesson: LessonWithProgress) => void
}

export default function LessonList({ course, selectedLesson, onSelectLesson }: LessonListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">{course.title}</h2>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        {course.lessons.map((lesson, index) => {
          const isSelected = selectedLesson?.id === lesson.id
          const isCompleted = lesson.progress?.completed

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-primary-500/10 border-primary-500' 
                  : 'hover:bg-gray-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isSelected ? (
                    <Play className="h-5 w-5 text-primary-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium ${
                    isSelected ? 'text-primary-400' : 'text-white'
                  }`}>
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {index + 1} de {course.lessons.length} aulas
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
