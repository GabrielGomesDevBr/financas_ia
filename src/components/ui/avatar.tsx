'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  fallback?: string
  className?: string
  size?: number
}

// Simple in-memory cache for avatar URLs
const avatarCache = new Map<string, string>()

export function Avatar({ src, alt, fallback, className = '', size = 32 }: AvatarProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!src) {
      setImageSrc(null)
      return
    }

    // Check cache first
    if (avatarCache.has(src)) {
      setImageSrc(avatarCache.get(src)!)
      return
    }

    // For Google avatars, use a proxy approach or add to cache
    if (src.includes('googleusercontent.com')) {
      // Cache the URL to reduce requests
      avatarCache.set(src, src)
      setImageSrc(src)
    } else {
      setImageSrc(src)
    }
  }, [src])

  if (!imageSrc || imageError) {
    // Fallback avatar
    const initials = fallback || alt.charAt(0).toUpperCase()
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
      unoptimized={imageSrc.includes('googleusercontent.com')} // Don't optimize external images
    />
  )
}
