
import React, { memo } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { AnimationType } from '@/types';

interface SeparatorComponentProps {
  animation?: AnimationType;
}

export const Separator = memo<SeparatorComponentProps>(function Separator() {
    const { theme } = useTheme();
    return <div className={theme.separator.base} role="separator" aria-orientation="horizontal" />;
});
