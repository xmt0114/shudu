import type { SudokuSize } from '../types/constants';
import type { SudokuBoard } from '../types/sudoku';

// 检查数独是否已完成
export function isSudokuComplete(board: SudokuBoard): boolean {
  const size = board.length;

  // 检查是否有空格
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].value === null) {
        return false;
      }
    }
  }

  // 检查是否有错误
  return !hasErrors(board);
}

// 检查数独是否有错误
export function hasErrors(board: SudokuBoard): boolean {
  const size = board.length;

  // 检查行
  for (let row = 0; row < size; row++) {
    if (hasRowError(board, row)) {
      return true;
    }
  }

  // 检查列
  for (let col = 0; col < size; col++) {
    if (hasColumnError(board, col)) {
      return true;
    }
  }

  // 检查区域
  const regions = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const regionIndex = board[row][col].region;
      if (!regions.has(regionIndex)) {
        regions.add(regionIndex);
        if (hasRegionError(board, regionIndex)) {
          return true;
        }
      }
    }
  }

  return false;
}

// 检查行是否有错误
export function hasRowError(board: SudokuBoard, row: number): boolean {
  const size = board.length;
  const values = new Set<number>();

  for (let col = 0; col < size; col++) {
    const value = board[row][col].value;
    if (value !== null) {
      if (values.has(value)) {
        return true;
      }
      values.add(value);
    }
  }

  return false;
}

// 检查列是否有错误
export function hasColumnError(board: SudokuBoard, col: number): boolean {
  const size = board.length;
  const values = new Set<number>();

  for (let row = 0; row < size; row++) {
    const value = board[row][col].value;
    if (value !== null) {
      if (values.has(value)) {
        return true;
      }
      values.add(value);
    }
  }

  return false;
}

// 检查区域是否有错误
export function hasRegionError(board: SudokuBoard, regionIndex: number): boolean {
  const size = board.length;
  const values = new Set<number>();

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].region === regionIndex) {
        const value = board[row][col].value;
        if (value !== null) {
          if (values.has(value)) {
            return true;
          }
          values.add(value);
        }
      }
    }
  }

  return false;
}

// 检查单元格是否有错误
export function hasCellError(board: SudokuBoard, row: number, col: number): boolean {
  const value = board[row][col].value;
  if (value === null) {
    return false;
  }

  const size = board.length;

  // 检查行
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c].value === value) {
      return true;
    }
  }

  // 检查列
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col].value === value) {
      return true;
    }
  }

  // 检查区域
  const regionIndex = board[row][col].region;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r !== row || c !== col) &&
          board[r][c].region === regionIndex &&
          board[r][c].value === value) {
        return true;
      }
    }
  }

  return false;
}

// 获取单元格可能的值
export function getPossibleValues(board: SudokuBoard, row: number, col: number): number[] {
  const size = board.length;
  if (board[row][col].value !== null) {
    return [];
  }

  const possible = new Set<number>();
  for (let num = 1; num <= size; num++) {
    possible.add(num);
  }

  // 检查行
  for (let c = 0; c < size; c++) {
    const value = board[row][c].value;
    if (value !== null) {
      possible.delete(value);
    }
  }

  // 检查列
  for (let r = 0; r < size; r++) {
    const value = board[r][col].value;
    if (value !== null) {
      possible.delete(value);
    }
  }

  // 检查区域
  const regionIndex = board[row][col].region;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].region === regionIndex) {
        const value = board[r][c].value;
        if (value !== null) {
          possible.delete(value);
        }
      }
    }
  }

  return Array.from(possible);
}
