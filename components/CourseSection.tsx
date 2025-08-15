'use client'

import { Course } from '@/types'
import CourseCard from './CourseCard'

interface CourseSectionProps {
  title: string
  courses: Course[]
}

export default function CourseSection({ title, courses }: CourseSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}
