import { defineStore } from 'pinia';
import type { DifficultyLevel, SudokuSize } from '../types/constants';
import type { GameState } from '../types/sudoku';
import { generatePuzzle } from '../utils/sudokuGenerator';
import { hasCellError } from '../utils/sudokuValidator';
import { ElMessage } from 'element-plus';

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    board: [],
    size: 9,
    difficulty: 'medium',
    startTime: new Date(),
    currentTime: 0,
    isPaused: false,
    isCompleted: false,
    moves: [],
    selectedCell: null,
    noteMode: false,
    solution: [],
    hintsRemaining: 3,
    checksRemaining: 5
  }),

  getters: {
    // 获取当前选中的单元格
    currentCell: (state) => {
      if (!state.selectedCell) return null;
      const { row, col } = state.selectedCell;
      return state.board[row][col];
    },

    // 获取游戏时间（格式化为分:秒）
    formattedTime: (state) => {
      const minutes = Math.floor(state.currentTime / 60);
      const seconds = state.currentTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // 获取可用的数字（1到size）
    availableNumbers: (state) => {
      return Array.from({ length: state.size }, (_, i) => i + 1);
    },
    
    // 获取原始谜题（只读）
    puzzle: (state) => {
      return state.board;
    },
    
    // 获取用户输入
    userInput: (state) => {
      return state.board;
    },
    
    // 获取笔记
    notes: (state) => {
      return state.board;
    }
  },

  actions: {
    // 开始新游戏
    startNewGame(size: SudokuSize, difficulty: DifficultyLevel) {
      this.size = size;
      this.difficulty = difficulty;
      this.board = generatePuzzle(size, difficulty);
      this.solution = []; // 应该在生成谜题时填充
      this.startTime = new Date();
      this.currentTime = 0;
      this.isPaused = false;
      this.isCompleted = false;
      this.moves = [];
      this.selectedCell = null;
      this.noteMode = false;
      
      // 根据难度和宫格大小设置提示次数
      const maxHints = this.calculateMaxHints(size, difficulty);
      this.hintsRemaining = maxHints;
      
      // 根据难度和宫格大小设置检查次数
      const maxChecks = this.calculateMaxChecks(size, difficulty);
      this.checksRemaining = maxChecks;
    },
    
    // 计算最大提示次数
    calculateMaxHints(size: SudokuSize, difficulty: DifficultyLevel): number {
      // 基础提示次数
      let baseHints = 3;
      
      // 根据难度调整
      switch(difficulty) {
        case 'easy':
          baseHints += 2;
          break;
        case 'medium':
          baseHints += 0;
          break;
        case 'hard':
          baseHints -= 1;
          break;
        case 'expert':
          baseHints -= 2;
          break;
      }
      
      // 根据宫格大小调整
      if (size === 4) {
        baseHints -= 1;
      } else if (size === 6) {
        baseHints += 0;
      } else if (size === 8) {
        baseHints += 1;
      } else if (size === 9) {
        baseHints += 1;
      }
      
      // 确保至少有1次提示
      return Math.max(1, baseHints);
    },
    
    // 计算最大检查次数
    calculateMaxChecks(size: SudokuSize, difficulty: DifficultyLevel): number {
      // 基础检查次数
      let baseChecks = 5;
      
      // 根据难度调整
      switch(difficulty) {
        case 'easy':
          baseChecks += 3;
          break;
        case 'medium':
          baseChecks += 0;
          break;
        case 'hard':
          baseChecks -= 2;
          break;
        case 'expert':
          baseChecks -= 3;
          break;
      }
      
      // 根据宫格大小调整
      if (size === 4) {
        baseChecks -= 1;
      } else if (size === 6) {
        baseChecks += 0;
      } else if (size === 8) {
        baseChecks += 1;
      } else if (size === 9) {
        baseChecks += 2;
      }
      
      // 确保至少有2次检查
      return Math.max(2, baseChecks);
    },

    // 选择单元格
    selectCell(row: number, col: number) {
      this.selectedCell = { row, col };
    },

    // 填入数字
    fillNumber(num: number) {
      if (!this.selectedCell || this.isCompleted || this.isPaused) return;

      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];

      // 如果是预设数字，不能修改
      if (cell.isGiven) return;

      if (this.noteMode) {
        // 笔记模式
        const noteIndex = cell.notes.indexOf(num);
        if (noteIndex === -1) {
          cell.notes.push(num);
          cell.notes.sort((a, b) => a - b);
        } else {
          cell.notes.splice(noteIndex, 1);
        }
      } else {
        // 普通模式
        const prevValue = cell.value;
        const prevNotes = [...cell.notes];

        // 如果点击的数字与当前值相同，则清除
        cell.value = prevValue === num ? null : num;

        // 清除笔记
        cell.notes = [];

        // 记录操作
        this.moves.push({
          row,
          col,
          prevValue,
          newValue: cell.value,
          prevNotes
        });

        // 检查单元格是否有错误
        if (cell.value !== null) {
          cell.isError = hasCellError(this.board, row, col);
        } else {
          cell.isError = false;
        }

        // 检查游戏是否完成
        this.checkCompletion();
      }
    },

    // 切换笔记模式
    toggleNoteMode() {
      this.noteMode = !this.noteMode;
    },

    // 撤销操作
    undo() {
      if (this.moves.length === 0) return;

      const lastMove = this.moves.pop()!;
      const { row, col, prevValue, prevNotes } = lastMove;

      this.board[row][col].value = prevValue;
      this.board[row][col].notes = prevNotes || [];
      this.board[row][col].isError = prevValue !== null && hasCellError(this.board, row, col);

      // 检查游戏是否完成
      this.checkCompletion();
    },
    
    // 检查是否可以撤销
    canUndo(): boolean {
      return this.moves.length > 0;
    },
    
    // 检查是否可以使用提示
    canUseHint(): boolean {
      return this.hintsRemaining > 0 && !this.isPaused && !this.isCompleted;
    },
    
    // 检查是否可以使用检查功能
    canUseCheck(): boolean {
      return this.checksRemaining > 0 && !this.isPaused && !this.isCompleted && this.selectedCell !== null;
    },
    
    // 获取提示
    getHint() {
      if (!this.canUseHint()) return;
      
      // 如果没有选中单元格，随机选择一个空白单元格
      if (!this.selectedCell) {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
          for (let col = 0; col < this.size; col++) {
            const cell = this.board[row][col];
            if (!cell.isGiven && cell.value === null) {
              emptyCells.push({ row, col });
            }
          }
        }
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.selectCell(randomCell.row, randomCell.col);
      }
      
      const { row, col } = this.selectedCell!;
      const cell = this.board[row][col];
      
      // 如果是预设数字或已经有值，不需要提示
      if (cell.isGiven || cell.value !== null) {
        ElMessage({
          message: '这个单元格已经有值了',
          type: 'warning'
        });
        return;
      }
      
      // 获取正确的值（这里假设已经有解决方案）
      // 实际应用中需要确保solution已经计算好
      const correctValue = 1; // 这里应该从solution中获取
      
      // 更新单元格值
      const prevValue = cell.value;
      const prevNotes = [...cell.notes];
      
      cell.value = correctValue;
      cell.notes = [];
      cell.isError = false;
      
      // 记录操作
      this.moves.push({
        row,
        col,
        prevValue,
        newValue: correctValue,
        prevNotes
      });
      
      // 减少提示次数
      this.hintsRemaining--;
      
      // 检查游戏是否完成
      this.checkCompletion();
      
      // 显示动画效果
      this.showCellAnimation(row, col);
    },
    
    // 显示单元格动画
    showCellAnimation(_row: number, _col: number) {
      // 这里可以实现单元格动画效果
    },
    
    // 检查选中的单元格
    checkSelectedCell() {
      if (!this.canUseCheck() || !this.selectedCell) return;
      
      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];
      
      // 如果单元格为空，不需要检查
      if (cell.value === null) {
        ElMessage({
          message: '请先填入数字',
          type: 'warning'
        });
        return;
      }
      
      // 检查单元格是否正确
      const isCorrect = !hasCellError(this.board, row, col);
      
      // 设置单元格状态
      cell.isError = !isCorrect;
      
      // 减少检查次数
      this.checksRemaining--;
      
      // 显示结果
      if (isCorrect) {
        ElMessage({
          message: '正确！',
          type: 'success'
        });
      } else {
        ElMessage({
          message: '错误！',
          type: 'error'
        });
      }
    },
    
    // 检查游戏是否完成
    checkCompletion() {
      // 检查所有单元格是否已填满且无错误
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          const cell = this.board[row][col];
          if (cell.value === null || hasCellError(this.board, row, col)) {
            this.isCompleted = false;
            return;
          }
        }
      }
      
      // 如果所有单元格都已正确填写，游戏完成
      this.isCompleted = true;
      ElMessage({
        message: '恭喜！你已完成游戏！',
        type: 'success'
      });
    },
    
    // 切换暂停状态
    togglePause() {
      this.isPaused = !this.isPaused;
    },
    
    // 更新游戏时间
    updateTime() {
      if (!this.isPaused && !this.isCompleted) {
        this.currentTime++;
      }
    },
    
    // 清除所有笔记
    clearAllNotes() {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          this.board[row][col].notes = [];
        }
      }
    },
    
    // 查找冲突的单元格
    findConflictCells(row: number, col: number, value: number) {
      const conflicts = [];
      const size = this.size;
      
      // 检查同一行
      for (let c = 0; c < size; c++) {
        if (c !== col && this.board[row][c].value === value) {
          conflicts.push({ row, col: c });
        }
      }
      
      // 检查同一列
      for (let r = 0; r < size; r++) {
        if (r !== row && this.board[r][col].value === value) {
          conflicts.push({ row: r, col });
        }
      }
      
      // 检查同一区域
      const regionSize = Math.sqrt(size);
      const regionStartRow = Math.floor(row / regionSize) * regionSize;
      const regionStartCol = Math.floor(col / regionSize) * regionSize;
      
      for (let r = regionStartRow; r < regionStartRow + regionSize; r++) {
        for (let c = regionStartCol; c < regionStartCol + regionSize; c++) {
          if ((r !== row || c !== col) && this.board[r][c].value === value) {
            conflicts.push({ row: r, col: c });
          }
        }
      }
      
      return conflicts;
    },
    
    // 检查所有错误
    checkAllErrors() {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          const cell = this.board[row][col];
          if (cell.value !== null) {
            cell.isError = hasCellError(this.board, row, col);
          }
        }
      }
    },
    
    // 重置游戏完成状态
    resetCompletionState() {
      this.isCompleted = false;
    },
    
    // 清除选中的单元格
    clearSelectedCell() {
      if (!this.selectedCell || this.isCompleted || this.isPaused) return;
      
      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];
      
      // 如果是预设数字，不能修改
      if (cell.isGiven) return;
      
      // 如果单元格已经为空，不需要清除
      if (cell.value === null && cell.notes.length === 0) return;
      
      // 保存当前状态用于撤销
      const prevValue = cell.value;
      const prevNotes = [...cell.notes];
      
      // 清除值和笔记
      cell.value = null;
      cell.notes = [];
      cell.isError = false;
      
      // 记录操作
      this.moves.push({
        row,
        col,
        prevValue,
        newValue: null,
        prevNotes
      });
    }
  }
});
