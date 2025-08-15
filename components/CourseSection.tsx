'use client'

import { Course } from '@/types'
import CourseCard from './CourseCard'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface CourseSectionProps {
  title: string
  courses: Course[]
}

export default function CourseSection({ title, courses }: CourseSectionProps) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  }

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
        {title}
      </h2>
      
      <div className="relative">
        <Slider {...settings} className="course-slider">
          {courses.map((course) => (
            <div key={course.id} className="px-2">
              <CourseCard course={course} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  )
}

// Componente para a seta de próxima
function NextArrow(props: any) {
  const { onClick } = props
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
      style={{ right: '-20px' }}
    >
      <ChevronRight className="h-6 w-6" />
    </button>
  )
}

// Componente para a seta anterior
function PrevArrow(props: any) {
  const { onClick } = props
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
      style={{ left: '-20px' }}
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
  )
}
