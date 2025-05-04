import React from 'react';
import { cn } from '@/lib/utils';

interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatarInitial?: string;
  className?: string;
}

export function Testimonial({
  name,
  role,
  company,
  content,
  rating = 5,
  avatarInitial,
  className,
  ...props
}: TestimonialProps) {
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#FF6F00]/30 hover:-translate-y-1 transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-center mb-4">
        {avatarInitial ? (
          <div className="w-12 h-12 bg-[#FF6F00]/20 rounded-full flex items-center justify-center text-xl font-bold text-[#FAA977]">
            {avatarInitial}
          </div>
        ) : (
          <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#FAA977]"
            >
              <path d="M18 6a4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4" />
              <path d="M10 12v7a4 4 0 0 0 8 0v-7" />
            </svg>
          </div>
        )}
        <div className="mr-4">
          <h4 className="font-bold">{company || name}</h4>
          {role && <p className="text-sm text-gray-400">{name}, {role}</p>}
          {!role && <p className="text-sm text-gray-400">{name}</p>}
        </div>
      </div>
      <p className="text-gray-300">{content}</p>
      {rating > 0 && (
        <div className="flex mt-4 text-[#FAA977]">
          {Array.from({ length: rating }).map((_, i) => (
            <span key={i}>★</span>
          ))}
          {Array.from({ length: 5 - rating }).map((_, i) => (
            <span key={i} className="text-gray-500">★</span>
          ))}
        </div>
      )}
    </div>
  );
} 