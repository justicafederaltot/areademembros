export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'member'
  created_at: string
}

export interface Course {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  created_at: string
}

export interface Lesson {
  id: number
  course_id: number
  title: string
  description: string
  video_url: string
  order_index: number
  created_at: string
}

export interface UserProgress {
  id?: number
  user_id?: number
  lesson_id?: number
  completed: boolean
  completed_at?: string | null
  created_at?: string
}

export interface LessonWithProgress extends Lesson {
  progress?: UserProgress
}

export interface CourseWithLessons extends Course {
  lessons: LessonWithProgress[]
}
