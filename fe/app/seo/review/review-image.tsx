"use client";

import Image from "next/image";
import { useState } from "react";

interface ReviewImageProps {
  src: string;
  alt: string;
}


export default function ReviewImage({ src, alt }: ReviewImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Placeholder
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://via.placeholder.com/400x300?text=No+Image";
      }}
    />
  );
}
