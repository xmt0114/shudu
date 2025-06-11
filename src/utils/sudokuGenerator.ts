import type { SudokuSize, DifficultyLevel } from '../types/constants';
import type { SudokuBoard, Region } from '../types/sudoku';

// 不同尺寸的区域定义
const regionDefinitions: Record<SudokuSize, Region[]> = {
  4: [
    // 2x2区域，共4个
    {startRow: 0, startCol: 0, width: 2, height: 2},
    {startRow: 0, startCol: 2, width: 2, height: 2},
    {startRow: 2, startCol: 0, width: 2, height: 2},
    {startRow: 2, startCol: 2, width: 2, height: 2}
  ],
  6: [
    // 2x3区域，共6个
    {startRow: 0, startCol: 0, width: 3, height: 2},
    {startRow: 0, startCol: 3, width: 3, height: 2},
    {startRow: 2, startCol: 0, width: 3, height: 2},
    {startRow: 2, startCol: 3, width: 3, height: 2},
    {startRow: 4, startCol: 0, width: 3, height: 2},
    {startRow: 4, startCol: 3, width: 3, height: 2}
  ],
  8: [
    // 2x4区域，共8个
    {startRow: 0, startCol: 0, width: 4, height: 2},
    {startRow: 0, startCol: 4, width: 4, height: 2},
    {startRow: 2, startCol: 0, width: 4, height: 2},
    {startRow: 2, startCol: 4, width: 4, height: 2},
    {startRow: 4, startCol: 0, width: 4, height: 2},
    {startRow: 4, startCol: 4, width: 4, height: 2},
    {startRow: 6, startCol: 0, width: 4, height: 2},
    {startRow: 6, startCol: 4, width: 4, height: 2}
  ],
  9: [
    // 3x3区域，共9个
    {startRow: 0, startCol: 0, width: 3, height: 3},
    {startRow: 0, startCol: 3, width: 3, height: 3},
    {startRow: 0, startCol: 6, width: 3, height: 3},
    {startRow: 3, startCol: 0, width: 3, height: 3},
    {startRow: 3, startCol: 3, width: 3, height: 3},
    {startRow: 3, startCol: 6, width: 3, height: 3},
    {startRow: 6, startCol: 0, width: 3, height: 3},
    {startRow: 6, startCol: 3, width: 3, height: 3},
    {startRow: 6, startCol: 6, width: 3, height: 3}
  ]
};

// 根据难度级别确定要移除的单元格数量
const cellsToRemoveByDifficulty: Record<DifficultyLevel, Record<SudokuSize, number>> = {
  easy: {
    4: 4,
    6: 12,
    8: 24,
    9: 30
  },
  medium: {
    4: 6,
    6: 18,
    8: 32,
    9: 40
  },
  hard: {
    4: 8,
    6: 24,
    8: 40,
    9: 50
  },
  expert: {
    4: 10,
    6: 28,
    8: 48,
    9: 60
  }
};

// 创建空棋盘
export function createEmptyBoard(size: SudokuSize): SudokuBoard {
  const board: SudokuBoard = [];

  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      // 确定单元格所在的区域
      const region = getRegionIndex(row, col, size);

      board[row][col] = {
        value: null,
        isGiven: false,
        notes: [],
        row,
        col,
        region
      };
    }
  }

  return board;
}

// 获取单元格所在的区域索引
function getRegionIndex(row: number, col: number, size: SudokuSize): number {
  const regions = regionDefinitions[size];

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    if (
      row >= region.startRow &&
      row < region.startRow + region.height &&
      col >= region.startCol &&
      col < region.startCol + region.width
    ) {
      return i;
    }
  }

  return -1; // 不应该发生
}

// 检查在指定位置放置数字是否有效
function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
  const size = board.length;

  // 检查行
  for (let c = 0; c < size; c++) {
    if (board[row][c].value === num) {
      return false;
    }
  }

  // 检查列
  for (let r = 0; r < size; r++) {
    if (board[r][col].value === num) {
      return false;
    }
  }

  // 检查区域
  const regionIndex = board[row][col].region;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].region === regionIndex && board[r][c].value === num) {
        return false;
      }
    }
  }

  return true;
}

// 使用回溯算法解决数独
function solveSudoku(board: SudokuBoard): boolean {
  const size = board.length;

  // 找到一个空格
  let emptyCell: [number, number] | null = null;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].value === null) {
        emptyCell = [row, col];
        break;
      }
    }
    if (emptyCell) break;
  }

  // 如果没有空格，说明已经解决
  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;

  // 尝试填入数字
  const numbers = Array.from({length: size}, (_, i) => i + 1);
  shuffleArray(numbers); // 随机化数字顺序，使生成的数独更随机

  for (const num of numbers) {
    if (isValid(board, row, col, num)) {
      board[row][col].value = num;

      if (solveSudoku(board)) {
        return true;
      }

      board[row][col].value = null; // 回溯
    }
  }

  return false;
}

// 生成完整的数独解决方案
export function generateCompleteSolution(size: SudokuSize): SudokuBoard {
  const board = createEmptyBoard(size);

  // 对于9宫格，可以先填充对角线上的3个3×3小方格
  if (size === 9) {
    fillRegion(board, 0);
    fillRegion(board, 4);
    fillRegion(board, 8);
  }

  // 使用回溯算法填充其余部分
  solveSudoku(board);

  return board;
}

// 填充指定区域
function fillRegion(board: SudokuBoard, regionIndex: number): void {
  const size = board.length;
  const numbers = Array.from({length: size}, (_, i) => i + 1);
  shuffleArray(numbers);

  let index = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].region === regionIndex) {
        board[row][col].value = numbers[index++];
      }
    }
  }
}

// 生成数独题目
export function generatePuzzle(size: SudokuSize, difficulty: DifficultyLevel): SudokuBoard {
  // 生成完整解决方案
  const solution = generateCompleteSolution(size);

  // 创建题目（深拷贝解决方案）
  const puzzle: SudokuBoard = JSON.parse(JSON.stringify(solution));

  // 根据难度级别确定要移除的单元格数量
  const cellsToRemove = cellsToRemoveByDifficulty[difficulty][size];

  // 获取所有位置
  const positions: [number, number][] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }

  // 随机打乱位置
  shuffleArray(positions);

  // 移除单元格
  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;

    const temp = puzzle[row][col].value;
    puzzle[row][col].value = null;

    // 检查是否仍有唯一解
    if (hasUniqueSolution(JSON.parse(JSON.stringify(puzzle)))) {
      removed++;
    } else {
      puzzle[row][col].value = temp; // 恢复
    }
  }

  // 标记给定的数字
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (puzzle[row][col].value !== null) {
        puzzle[row][col].isGiven = true;
      }
    }
  }

  return puzzle;
}

// 检查数独是否有唯一解
function hasUniqueSolution(board: SudokuBoard): boolean {
  let solutionCount = 0;

  function backtrack(board: SudokuBoard): boolean {
    // 找到一个空格
    let emptyCell: [number, number] | null = null;
    const size = board.length;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col].value === null) {
          emptyCell = [row, col];
          break;
        }
      }
      if (emptyCell) break;
    }

    // 如果没有空格，说明找到一个解
    if (!emptyCell) {
      solutionCount++;
      return solutionCount > 1; // 如果找到第二个解，立即返回
    }

    const [row, col] = emptyCell;

    // 尝试填入数字
    for (let num = 1; num <= size; num++) {
      if (isValid(board, row, col, num)) {
        board[row][col].value = num;

        if (backtrack(board)) {
          return true;
        }

        board[row][col].value = null; // 回溯
      }
    }

    return false;
  }

  backtrack(board);
  return solutionCount === 1;
}

// 辅助函数：随机打乱数组
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
