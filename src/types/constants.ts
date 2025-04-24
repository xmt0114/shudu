// 导出难度级别的常量值
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// 导出尺寸的常量值
export const SUDOKU_SIZES = [4, 6, 8, 9] as const;
export type SudokuSize = typeof SUDOKU_SIZES[number];
