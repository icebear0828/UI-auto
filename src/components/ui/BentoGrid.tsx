
import React from 'react';
import { RenderChildren } from './renderUtils';
import { useDeviceContext } from '@/components/DeviceContext';

export const BentoContainer = ({ children, onAction, path }: any) => {
  const { isMobile } = useDeviceContext();

  // 🔧 Mobile: 2-column grid, Desktop: 4-column grid
  const gridCols = isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4 w-full auto-rows-[minmax(180px,auto)]`}>
      <RenderChildren children={children} onAction={onAction} parentPath={path} />
    </div>
  );
};

export const BentoCard = ({ children, title, colSpan = 1, rowSpan = 1, variant = 'DEFAULT', bgImage, onAction, path }: any) => {
  const colSpanClass = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
  }[colSpan as 1 | 2 | 3 | 4] || 'md:col-span-1';

  const rowSpanClass = {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
    3: 'md:row-span-3',
  }[rowSpan as 1 | 2 | 3] || 'md:row-span-1';

  const style = bgImage ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <div
      className={`
        ${colSpanClass} ${rowSpanClass}
        group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl transition-all hover:border-white/20 hover:shadow-2xl
        flex flex-col
      `}
      style={style}
    >
      {bgImage && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />}

      <div className="relative z-10 flex-1 flex flex-col h-full">
        {title && (
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
            {title}
          </h3>
        )}
        <div className="flex-1 min-h-0 w-full">
          <RenderChildren children={children} onAction={onAction} parentPath={path} />
        </div>
      </div>
    </div>
  );
};
