import React from 'react';

interface LinkifyTextProps {
  text: string;
  className?: string;
}

export default function LinkifyText({ text, className = '' }: LinkifyTextProps) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split text by URLs
  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 underline hover:text-amber-200 transition"
            >
              {part}
            </a>
          );
        }
        // Return regular text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
