
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import type { UIAction } from '@/types';

interface CalendarProps {
  label?: string;
  selectedDate?: string; // YYYY-MM-DD
  onAction?: (action: UIAction) => void;
  path?: string;
}

export const Calendar = ({ label, selectedDate, onAction, path }: CalendarProps) => {
  const { theme } = useTheme();
  
  // Local state for navigation (View Month)
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Derived state for selection
  const activeDate = selectedDate ? new Date(selectedDate) : null;

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const newDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (onAction && path) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { selectedDate: newDateStr }
      });
    }
  };

  // Generate grid cells
  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className={theme.calendar.dayOutside} />);
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = activeDate 
      && activeDate.getDate() === d 
      && activeDate.getMonth() === month 
      && activeDate.getFullYear() === year;
      
    const isToday = new Date().getDate() === d 
      && new Date().getMonth() === month 
      && new Date().getFullYear() === year;

    days.push(
      <button
        key={d}
        onClick={() => handleDateClick(d)}
        className={`
          ${theme.calendar.day} 
          ${isSelected ? theme.calendar.daySelected : (isToday ? theme.calendar.dayToday : theme.calendar.dayDefault)}
        `}
      >
        {d}
      </button>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={theme.calendar.base}>
      <div className={theme.calendar.header}>
        <button onClick={prevMonth} className={theme.calendar.navBtn}><ChevronLeft className="w-5 h-5" /></button>
        <span className={theme.calendar.title}>{monthNames[month]} {year}</span>
        <button onClick={nextMonth} className={theme.calendar.navBtn}><ChevronRight className="w-5 h-5" /></button>
      </div>
      
      <div className={theme.calendar.grid}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className={theme.calendar.weekday}>{d}</div>
        ))}
        {days}
      </div>
    </div>
  );
};
