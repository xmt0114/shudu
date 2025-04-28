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
    maxHints: 3
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
      
      // 根据难度和宫格大小设置提示次数
      this.maxHints = this.calculateMaxHints(size, difficulty);
      this.hintsRemaining = this.maxHints;
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

        // 检查单元格是否有错误
        cell.isError = cell.value !== null && hasCellError(this.board, row, col);

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
      if (isSudokuComplete(this.board)) {
        this.isCompleted = true;
        this.isPaused = true;
      }
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

    // 检查错误
    checkErrors() {
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          const cell = this.board[row][col];
          if (cell.value !== null) {
            cell.isError = hasCellError(this.board, row, col);
          }
        }
      }
    },
    

  }
});
