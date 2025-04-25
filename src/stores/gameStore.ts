import { defineStore } from 'pinia';
import { DIFFICULTY_LEVELS, SUDOKU_SIZES } from '../types/constants';
import type { SudokuSize, DifficultyLevel } from '../types/constants';
import type { SudokuBoard, Move, GameState } from '../types/sudoku';
import { generatePuzzle } from '../utils/sudokuGenerator';
import { isSudokuComplete, hasCellError, getPossibleValues } from '../utils/sudokuValidator';

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
    notification: {
      message: '',
      visible: false,
      type: 'info'
    },
    notificationQueue: [],
    cellAnimation: null
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

    // 获取提示
    getHint() {
      if (!this.selectedCell || this.isCompleted || this.isPaused) {
        this.showNotification('游戏暂停或已完成', 'warning');
        return;
      }

      const { row, col } = this.selectedCell;
      const cell = this.board[row][col];

      // 如果是预设数字，显示通知
      if (cell.isGiven) {
        this.showNotification('这是预设数字，不能修改', 'info');
        return;
      }

      // 如果已有正确值，显示通知
      if (cell.value !== null && !cell.isError) {
        this.showNotification('此格已有正确数字', 'info');
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
        
        // 显示成功通知
        this.showNotification('已填入提示数字', 'success');
        
        // 检查游戏是否完成
        this.checkCompletion();
      } else {
        this.showNotification('无法确定此格的值', 'warning');
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
    
    // 显示通知
    showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
      // 创建新的通知对象
      const newNotification = {
        message,
        type,
        id: Date.now()
      };
      
      // 将通知添加到队列
      this.notificationQueue.push(newNotification);
      
      // 如果当前没有显示通知，则显示队列中的第一个
      if (!this.notification.visible) {
        this.processNotificationQueue();
      }
    },
    
    // 处理通知队列
    processNotificationQueue() {
      // 如果队列为空，则不做任何操作
      if (this.notificationQueue.length === 0) {
        return;
      }
      
      // 取出队列中的第一个通知
      const nextNotification = this.notificationQueue.shift();
      
      // 显示通知
      this.notification = {
        message: nextNotification.message,
        visible: true,
        type: nextNotification.type
      };
      
      // 7秒后自动关闭通知，并处理队列中的下一个通知
      setTimeout(() => {
        this.notification.visible = false;
        
        // 延迟一小段时间后处理下一个通知，确保动画效果完成
        setTimeout(() => {
          if (this.notificationQueue.length > 0) {
            this.processNotificationQueue();
          }
        }, 100);
      }, 2000);
    }
  }
});
