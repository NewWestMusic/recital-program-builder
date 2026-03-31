import React, { forwardRef } from 'react';
import { ProgramData } from './types';
import { motion } from 'motion/react';

interface Props {
  data: ProgramData;
  onUpdateLogoPosition?: (pos: { x: number, y: number }) => void;
  onUpdateHeaderPosition?: (pos: { x: number, y: number }) => void;
}

export const ProgramPreview = forwardRef<HTMLDivElement, Props>(({ data, onUpdateLogoPosition, onUpdateHeaderPosition }, ref) => {
  let leftCount = data.performers.length;
  if (data.firstColumnLimit !== undefined) {
    leftCount = Math.min(data.firstColumnLimit, data.performers.length);
  } else {
    const maxLeft = data.logo ? 10 : 12;
    if (data.performers.length > maxLeft) {
      const rightCount = data.performers.length - maxLeft;
      if (rightCount > maxLeft) {
        leftCount = Math.ceil(data.performers.length / 2);
      } else {
        leftCount = maxLeft;
      }
    }
  }

  const leftPerformers = data.performers.slice(0, leftCount);
  const rightPerformers = data.performers.slice(leftCount);

  return (
    <div
      ref={ref}
      className="relative bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0"
      style={{
        width: '11in',
        height: '8.5in',
        fontFamily: data.fontFamily === 'serif' ? 'Georgia, serif' : 'Helvetica, sans-serif',
        color: data.themeColor,
        fontSize: `${(data.fontSizeScale || 1) * 16}px`,
      }}
    >
      {/* Background Image */}
      {data.background && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${data.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Content Layout */}
      <div className="relative z-10 w-full h-full p-[0.75in] box-border flex gap-[1in]">
        {data.layout === 'folded' ? (
          <>
            {/* Left Column (Header + First Half of Performers) */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="text-center flex flex-col items-center" style={{ marginBottom: `${data.headerSpacing ?? 1.5}em` }}>
                {data.logo && (
                  <motion.img 
                    src={data.logo} 
                    alt="Logo" 
                    className="h-20 object-contain mb-[0.75em] cursor-move relative z-50" 
                    drag
                    dragMomentum={false}
                    initial={{ x: data.logoPosition?.x || 0, y: data.logoPosition?.y || 0 }}
                    onDragEnd={(e, info) => {
                      // Adjust offset by the scale of the container if possible, 
                      // but for simplicity we just add the raw offset.
                      onUpdateLogoPosition?.({
                        x: (data.logoPosition?.x || 0) + info.offset.x,
                        y: (data.logoPosition?.y || 0) + info.offset.y,
                      });
                    }}
                  />
                )}
                <motion.div
                  className="flex flex-col items-center cursor-move relative z-40"
                  drag
                  dragMomentum={false}
                  initial={{ x: data.headerPosition?.x || 0, y: data.headerPosition?.y || 0 }}
                  onDragEnd={(e, info) => {
                    onUpdateHeaderPosition?.({
                      x: (data.headerPosition?.x || 0) + info.offset.x,
                      y: (data.headerPosition?.y || 0) + info.offset.y,
                    });
                  }}
                >
                  <h1 className="font-bold mb-[0.25em] leading-tight" style={{ fontSize: `${1.875 * (data.titleFontSizeScale ?? 1)}em` }}>{data.title}</h1>
                  <h2 className="text-[1.25em] italic mb-[0.5em] leading-tight">{data.subtitle}</h2>
                  <p className="text-[1em] leading-snug">{data.date} {data.time && `| ${data.time}`}</p>
                  <p className="text-[1em] leading-snug">{data.location}</p>
                </motion.div>
              </div>
              
              {/* Left Performers */}
              <div className="flex flex-col">
                {leftPerformers.map((p) => (
                  <div key={p.id} className="mb-[0.75em] break-inside-avoid">
                    <div className="flex items-start border-b border-dotted border-gray-300 pb-[0.25em]">
                      <div className="font-bold text-[1em] pr-[1em]" style={{ width: `${data.nameColumnWidth || 40}%` }}>{p.name}</div>
                      <div className="italic flex-1 text-right text-[1em]">{p.piece}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Remaining Performers) */}
            <div className="flex-1 flex flex-col">
              {rightPerformers.map((p) => (
                <div key={p.id} className="mb-[0.75em] break-inside-avoid">
                  <div className="flex items-start border-b border-dotted border-gray-300 pb-[0.25em]">
                    <div className="font-bold text-[1em] pr-[1em]" style={{ width: `${data.nameColumnWidth || 40}%` }}>{p.name}</div>
                    <div className="italic flex-1 text-right text-[1em]">{p.piece}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="text-center flex flex-col items-center break-inside-avoid" style={{ marginBottom: `${data.headerSpacing ?? 1.5}em` }}>
              {data.logo && (
                <motion.img 
                  src={data.logo} 
                  alt="Logo" 
                  className="h-20 object-contain mb-[0.75em] cursor-move relative z-50" 
                  drag
                  dragMomentum={false}
                  initial={{ x: data.logoPosition?.x || 0, y: data.logoPosition?.y || 0 }}
                  onDragEnd={(e, info) => {
                    onUpdateLogoPosition?.({
                      x: (data.logoPosition?.x || 0) + info.offset.x,
                      y: (data.logoPosition?.y || 0) + info.offset.y,
                    });
                  }}
                />
              )}
              <motion.div
                className="flex flex-col items-center cursor-move relative z-40"
                drag
                dragMomentum={false}
                initial={{ x: data.headerPosition?.x || 0, y: data.headerPosition?.y || 0 }}
                onDragEnd={(e, info) => {
                  onUpdateHeaderPosition?.({
                    x: (data.headerPosition?.x || 0) + info.offset.x,
                    y: (data.headerPosition?.y || 0) + info.offset.y,
                  });
                }}
              >
                <h1 className="font-bold mb-[0.25em] leading-tight" style={{ fontSize: `${1.875 * (data.titleFontSizeScale ?? 1)}em` }}>{data.title}</h1>
                <h2 className="text-[1.25em] italic mb-[0.5em] leading-tight">{data.subtitle}</h2>
                <p className="text-[1em] leading-snug">{data.date} {data.time && `| ${data.time}`}</p>
                <p className="text-[1em] leading-snug">{data.location}</p>
              </motion.div>
            </div>

            {/* Performers */}
            <div>
              {data.performers.map((p) => (
                <div key={p.id} className="mb-[0.75em] break-inside-avoid">
                  <div className="flex items-start border-b border-dotted border-gray-300 pb-[0.25em]">
                    <div className="font-bold text-[1em] pr-[1em]" style={{ width: `${data.nameColumnWidth || 40}%` }}>{p.name}</div>
                    <div className="italic flex-1 text-right text-[1em]">{p.piece}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
