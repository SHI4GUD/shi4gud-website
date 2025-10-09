import React from 'react';

interface YouTubePlayerProps {
  url: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
}

// A simple regex to extract the video ID from various YouTube URL formats
const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ url, size = 'medium', alignment = 'center' }) => {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return <div className="text-red-500">Invalid YouTube URL provided.</div>;
  }

  // Size classes
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full'
  };

  // Alignment classes
  const alignmentClasses = {
    left: 'ml-0 mr-auto',
    center: 'mx-auto',
    right: 'ml-auto mr-0'
  };

  return (
    <div className={`aspect-video w-full my-5 ${sizeClasses[size]} ${alignmentClasses[alignment]}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded-xl border-0"
      ></iframe>
    </div>
  );
};

export default YouTubePlayer; 