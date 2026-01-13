// Utility functions for formatting data

/**
 * Format number to display with specified decimal places
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (value === null || value === undefined) return '0';
  const numValue = Number(value);
  if (isNaN(numValue)) return '0';
  return numValue.toFixed(decimals);
};

/**
 * Format calories display
 */
export const formatCalories = (calories: number | null | undefined): string => {
  return formatNumber(calories, 0);
};

/**
 * Format macronutrient (protein, carbs, fat) display
 */
export const formatMacro = (value: number | null | undefined): string => {
  return formatNumber(value, 0);
};

/**
 * Format date to display string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date to short display (e.g., "Today", "Yesterday", or "Mon, Jan 8")
 */
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time part for comparison
  const resetTime = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const targetDate = resetTime(d);
  const todayDate = resetTime(today);
  const yesterdayDate = resetTime(yesterday);

  if (targetDate.getTime() === todayDate.getTime()) {
    return 'Today';
  } else if (targetDate.getTime() === yesterdayDate.getTime()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Calculate percentage for progress bars
 */
export const calculatePercentage = (current: number | null | undefined, goal: number | null | undefined): number => {
  if (current === null || current === undefined || isNaN(current)) return 0;
  if (goal === null || goal === undefined || isNaN(goal) || goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

/**
 * Get color based on percentage completion
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#4CAF50'; // Green
  if (percentage < 80) return '#FF9800'; // Orange
  if (percentage < 100) return '#F44336'; // Red
  return '#F44336'; // Red (over goal)
};

/**
 * Format meal type for display
 */
export const formatMealType = (mealType: string): string => {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
};

/**
 * Get meal type emoji
 */
export const getMealTypeEmoji = (mealType: string): string => {
  const emojis: { [key: string]: string } = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍎',
  };
  return emojis[mealType.toLowerCase()] || '🍽️';
};

/**
 * Format time from date
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format serving size display
 */
export const formatServing = (size: number | null | undefined, unit: string | null | undefined): string => {
  if (!size || !unit) return 'Unknown serving';
  return `${formatNumber(size, 1)} ${unit}`;
};
