import { defineStore } from 'pinia';
import { DIFFICULTY_LEVELS, SUDOKU_SIZES } from '../types/constants';
import type { SudokuSize, DifficultyLevel } from '../types/constants';
import type { SudokuBoard, Move, GameState } from '../types/sudoku';
import { generatePuzzle } from '../utils/sudokuGenerator';
import { isSudokuComplete, hasCellError, getPossibleValues } from '../utils/sudokuValidator';
import { ElMessage } from 'element-plus';

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    board: [],
    size: 9,
    difficulty: 'medium',
    startTime: null,
    currentTime: 0,
    isPaused: false,
    isCompleted: false,
    moveHistory: [],
    selectedCell: null,
    noteMode: false,
    cellAnimation: null,
    hintsRemaining: 3,
    maxHints: 3,
    checksRemaining: 5,
    maxChecks: 5,
    conflictCells: [],
    showErrors: false
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
      this.startTime = new Date();
      this.currentTime = 0;
      this.isPaused = false;
      this.isCompleted = false;
      this.moveHistory = [];
      this.selectedCell = null;
      this.noteMode = false;
      this.conflictCells = [];
      this.showErrors = false;
      
      // 根据难度和宫格大小设置提示次数
      this.maxHints = this.calculateMaxHints(size, difficulty);
      this.hintsRemaining = this.maxHints;
      
      // 根据难度和宫格大小设置检查次数
      this.maxChecks = this.calculateMaxChecks(size, difficulty);
      this.checksRemaining = this.maxChecks;
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

        // 如果点击的数字与当前值相同，则清除
        cell.value = prevValue === num ? null : num;

        // 清除笔记
        cell.notes = [];

        // 记录操作
        this.moveHistory.push({
          row,
          col,
          prevValue,
          newValue: cell.value,
          timestamp: Date.now()
        });

        // 只有在显示错误的模式下才立即显示错误
        if (this.showErrors && cell.value !== null) {
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
      if (this.moveHistory.length === 0) return;

      const lastMove = this.moveHistory.pop()!;
      const { row, col, prevValue } = lastMove;

      this.board[row][col].value = prevValue;
      this.board[row][col].isError = prevValue !== null && hasCellError(this.board, row, col);

      // 检查游戏是否完成
      this.checkCompletion();
    },
    
    // 检查是否可以撤销
    canUndo(): boolean {
      return this.moveHistory.length > 0;
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
      // 检查是否选中了单元格
      if (!this.selectedCell) {
        ElMessage.warning('请选中某个单元格');
        return;
      }
      
      // 检查游戏状态
      if (this.isCompleted || this.isPaused) {
        ElMessage.warning('游戏暂停或已完成');
        return;
      }
      
      // 检查提示次数
      if (this.hintsRemaining <= 0) {
        ElMessage.warning('提示次数已用完');
        return;
      }

      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];

      // 如果是预设数字，显示通知
      if (cell.isGiven) {
        ElMessage.info('这是预设数字，不能修改');
        return;
      }

      // 如果已有正确值，显示通知
      if (cell.value !== null && !cell.isError) {
        ElMessage.info('此格已有正确数字');
        return;
      }

      // 使用getPossibleValues获取可能的值
      const possibleValues = getPossibleValues(this.board, row, col);
      
      // 如果有可能的值，随机选择一个
      if (possibleValues.length > 0) {
        const prevValue = cell.value;
        const newValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        
        // 设置单元格动画
        this.cellAnimation = { row, col };
        setTimeout(() => {
          this.cellAnimation = null;
        }, 500);
        
        // 填入新值
        cell.value = newValue;
        cell.notes = [];
        cell.isError = false; // 提示的值应该是正确的
        
        // 记录操作
        this.moveHistory.push({
          row,
          col,
          prevValue,
          newValue,
          timestamp: Date.now()
        });
        
        // 减少提示次数
        this.hintsRemaining--;
        
        // 显示成功通知
        ElMessage.success(`已填入提示数字，剩余提示次数: ${this.hintsRemaining}`);
        
        // 检查游戏是否完成
        this.checkCompletion();
      } else {
        // 如果当前单元格有错误值，则清除错误值并提示
        if (cell.value !== null && cell.isError) {
          const prevValue = cell.value;
          cell.value = null;
          cell.isError = false;
          
          // 重新尝试获取可能的值
          const newPossibleValues = getPossibleValues(this.board, row, col);
          if (newPossibleValues.length > 0) {
            const newValue = newPossibleValues[Math.floor(Math.random() * newPossibleValues.length)];
            
            // 设置单元格动画
            this.cellAnimation = { row, col };
            setTimeout(() => {
              this.cellAnimation = null;
            }, 500);
            
            // 填入新值
            cell.value = newValue;
            cell.notes = [];
            
            // 记录操作
            this.moveHistory.push({
              row,
              col,
              prevValue,
              newValue,
              timestamp: Date.now()
            });
            
            // 减少提示次数
            this.hintsRemaining--;
            
            // 显示成功通知
            ElMessage.success(`已修正错误并填入正确数字，剩余提示次数: ${this.hintsRemaining}`);
            
            // 检查游戏是否完成
            this.checkCompletion();
            return;
          }
        }
        
        ElMessage.warning('无法确定此格的值');
      }
    },

    // 检查游戏是否完成
    checkCompletion() {
      // 检查是否有空格
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          if (this.board[row][col].value === null) {
            return false;
          }
        }
      }
      
      // 检查是否有错误
      const hasError = this.checkAllErrors();
      
      if (!hasError) {
        this.isCompleted = true;
        this.isPaused = true;
      }
      
      return !hasError;
    },

    // 暂停/继续游戏
    togglePause() {
      this.isPaused = !this.isPaused;
    },

    // 更新游戏时间
    updateTime() {
      if (!this.isPaused && !this.isCompleted && this.startTime) {
        this.currentTime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
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

    // 检查当前选中单元格
    checkSelectedCell() {
      // 检查是否选中了单元格
      if (!this.selectedCell) {
        ElMessage.warning('请选中某个单元格');
        return;
      }
      
      // 检查游戏状态
      if (this.isCompleted || this.isPaused) {
        ElMessage.warning('游戏暂停或已完成');
        return;
      }
      
      // 检查检查次数
      if (this.checksRemaining <= 0) {
        ElMessage.warning('检查次数已用完');
        return;
      }

      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];

      // 如果是预设数字，显示通知
      if (cell.isGiven) {
        ElMessage.info('这是预设数字，不需要检查');
        return;
      }

      // 如果单元格为空，显示通知
      if (cell.value === null) {
        ElMessage.info('请先填入数字再检查');
        return;
      }

      // 减少检查次数
      this.checksRemaining--;
      
      // 检查单元格是否有错误
      const hasError = hasCellError(this.board, row, col);
      
      if (hasError) {
        // 找出冲突的单元格
        this.findConflictCells(row, col, cell.value);
        
        // 设置当前单元格为错误
        cell.isError = true;
        
        // 显示错误通知
        ElMessage.error(`数字填写错误，剩余检查次数: ${this.checksRemaining}`);
        
        // 设置动画效果，3秒后恢复
        setTimeout(() => {
          // 清除冲突单元格
          this.conflictCells = [];
          // 清除错误标记
          cell.isError = false;
        }, 3000);
      } else {
        // 显示成功通知
        ElMessage.success(`数字填写正确，剩余检查次数: ${this.checksRemaining}`);
      }
    },
    
    // 找出冲突的单元格
    findConflictCells(row: number, col: number, value: number) {
      this.conflictCells = [];
      const size = this.size;
      const regionIndex = this.board[row][col].region;
      
      // 检查行
      for (let c = 0; c < size; c++) {
        if (c !== col && this.board[row][c].value === value) {
          this.conflictCells.push({ row, col: c });
        }
      }
      
      // 检查列
      for (let r = 0; r < size; r++) {
        if (r !== row && this.board[r][col].value === value) {
          this.conflictCells.push({ row: r, col });
        }
      }
      
      // 检查区域
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if ((r !== row || c !== col) &&
              this.board[r][c].region === regionIndex &&
              this.board[r][c].value === value) {
            this.conflictCells.push({ row: r, col: c });
          }
        }
      }
    },
    
    // 检查所有单元格错误（仅用于游戏完成检查）
    checkAllErrors() {
      let hasError = false;
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          const cell = this.board[row][col];
          if (cell.value !== null) {
            const cellHasError = hasCellError(this.board, row, col);
            if (cellHasError) {
              hasError = true;
            }
          }
        }
      }
      return hasError;
    },
    
    // 重置游戏完成状态
    resetCompletionState() {
      this.isCompleted = false;
    },

    // 清除选中的单元格
    clearSelectedCell() {
      // 如果没有选中单元格或游戏已完成或暂停，不执行操作
      if (this.selectedCell === null || this.isCompleted || this.isPaused) {
        return;
      }

      const { row, col } = this.selectedCell;

      // 如果是原始数字，不能修改
      if (this.board[row][col].isGiven) {
        return;
      }

      // 如果单元格已经是空的，不执行任何操作
      if (this.board[row][col].value === null && this.board[row][col].notes.length === 0) {
        return;
      }

      // 保存操作用于撤销
      this.moveHistory.push({
        row,
        col,
        prevValue: this.board[row][col].value,
        newValue: null,
        timestamp: Date.now()
      });

      // 清除单元格的值和笔记
      this.board[row][col].value = null;
      this.board[row][col].notes = [];
      
      // 更新冲突
      this.conflictCells = [];
    }
  }
});
