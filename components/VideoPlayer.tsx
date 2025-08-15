'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  lessonId: number
  onComplete: () => void
}

export default function VideoPlayer({ videoUrl, lessonId, onComplete }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Extrair o ID do vídeo do YouTube da URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeVideoId(videoUrl)

  useEffect(() => {
    // Listener para detectar quando o vídeo termina
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'ended' && iframeRef.current) {
        onComplete()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onComplete])

  if (!videoId) {
    return (
      <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
        <p className="text-gray-400">URL do vídeo inválida</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Player"
        />
      </div>
    </div>
  )
}
