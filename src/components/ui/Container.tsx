
import React, { memo } from 'react';
import { RenderChildren } from './renderUtils';
import { useTheme } from '@/components/ThemeContext';
import { useDeviceContext } from '@/components/DeviceContext';
import { UIAction, TypedUINode, AnimationType } from '@/types';

type LayoutType = 'ROW' | 'COL' | 'WRAP' | 'CENTER' | 'GRID';
type GapType = 'GAP_SM' | 'GAP_MD' | 'GAP_LG' | 'GAP_NONE';
type BackgroundType = 'DEFAULT' | 'CARD' | 'GRADIENT_BLUE' | 'GRADIENT_VIOLET' | 'GRADIENT_ROSE';

interface ContainerComponentProps {
  children?: TypedUINode[];
  layout?: LayoutType;
  gap?: GapType;
  padding?: boolean;
  background?: BackgroundType;
  bgImage?: string;
  className?: string;
  onAction?: (action: UIAction) => void;
  path?: string;
  animation?: AnimationType;
}

export const Container = memo<ContainerComponentProps>(function Container({
  children,
  layout = 'COL',
  gap = 'GAP_MD',
  padding = false,
  background = 'DEFAULT',
  bgImage,
  className = '',
  onAction,
  path
}) {
  const { theme } = useTheme();
  const { isMobile } = useDeviceContext();

  // 🔧 Device-adaptive layout: convert ROW to COL on mobile when >2 children
  const childCount = Array.isArray(children) ? children.length : (children ? 1 : 0);
  const adaptedLayout = isMobile && layout === 'ROW' && childCount > 2 ? 'COL' : layout;

  const layoutClass = theme.container.layouts[adaptedLayout as keyof typeof theme.container.layouts] || theme.container.layouts.COL;
  const gapClass = theme.container.gaps[gap as keyof typeof theme.container.gaps] || theme.container.gaps.GAP_MD;
  const bgClass = bgImage ? '' : (theme.container.backgrounds[background as keyof typeof theme.container.backgrounds] || theme.container.backgrounds.DEFAULT);
  const padClass = padding ? 'p-6 md:p-8' : '';

  const style = bgImage ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <div
      className={`flex w-full ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className} transition-all relative overflow-hidden`}
      style={style}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}

      <div className="relative z-10 w-full flex flex-col h-full">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
});
