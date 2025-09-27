'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  lessonId: number
  onComplete: () => void
}

export default function VideoPlayer({ videoUrl, lessonId, onComplete }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Detectar tipo de vídeo e extrair ID
  const getVideoInfo = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return { type: 'youtube', id: match[2] }
      }
    }
    
    // Dailymotion - URLs completas
    if (url.includes('dailymotion.com')) {
      const regExp = /dailymotion\.com\/video\/([^?&]+)/
      const match = url.match(regExp)
      if (match) {
        return { type: 'dailymotion', id: match[1] }
      }
    }
    
    // Dailymotion - URLs encurtadas (dai.ly)
    if (url.includes('dai.ly/')) {
      const regExp = /dai\.ly\/([^?&]+)/
      const match = url.match(regExp)
      if (match) {
        return { type: 'dailymotion', id: match[1] }
      }
    }
    
    return null
  }

  const videoInfo = getVideoInfo(videoUrl)

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

  if (!videoInfo) {
    return (
      <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
        <p className="text-gray-400">URL do vídeo inválida. Suportamos YouTube e Dailymotion.</p>
      </div>
    )
  }

  const getEmbedUrl = () => {
    if (videoInfo.type === 'youtube') {
      return `https://www.youtube.com/embed/${videoInfo.id}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`
    } else if (videoInfo.type === 'dailymotion') {
      return `https://www.dailymotion.com/embed/video/${videoInfo.id}?autoplay=0&controls=1&ui-info=0&ui-logo=0`
    }
    return ''
  }

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
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
