// 使用type-only导入
import type { DifficultyLevel, SudokuSize } from './constants';

// 重新导出类型
export type { DifficultyLevel, SudokuSize };

// 单元格类型
export interface SudokuCell {
  value: number | null;       // 当前值，null表示空
  isGiven: boolean;           // 是否为预设数字
  notes: number[];            // 笔记
  isError?: boolean;          // 是否有错误
  isHighlighted?: boolean;    // 是否高亮
  row: number;                // 行索引
  col: number;                // 列索引
  region: number;             // 区域索引
}

// 数独棋盘类型
export type SudokuBoard = SudokuCell[][];

// 区域定义
export interface Region {
  startRow: number;
  startCol: number;
  width: number;
  height: number;
}

// 操作记录
export interface Move {
  row: number;
  col: number;
  prevValue: number | null;
  newValue: number | null;
  prevNotes: number[];
}

// 游戏状态
export interface GameState {
  size: SudokuSize;
  difficulty: DifficultyLevel;
  board: SudokuBoard;
  solution: SudokuBoard;
  moves: Move[];
  startTime: Date;
  currentTime: number;        // 游戏时间（秒）
  isPaused: boolean;
  isCompleted: boolean;
  noteMode: boolean;          // 是否处于笔记模式
  selectedCell: { row: number; col: number } | null;
  hintsRemaining: number;     // 剩余提示次数
  checksRemaining: number;    // 剩余检查次数
}
