<template>
  <div
    class="sudoku-board max-w-md mx-auto w-full"
    :class="[
      size === 4 ? 'grid-cols-4' :
      size === 6 ? 'grid-cols-6' :
      size === 8 ? 'grid-cols-8' :
      'grid-cols-9'
    ]"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <SudokuCell
      v-for="(cell, index) in flattenedBoard"
      :key="`${cell.row}-${cell.col}`"
      :cell="cell"
      :row="cell.row"
      :col="cell.col"
      :is-selected="isSelected(cell.row, cell.col)"
      :is-same-value="isSameValue(cell)"
      :max-value="size"
      :bg-color="getCellBackgroundColor(cell.row, cell.col)"
      :is-conflict="isConflictCell(cell.row, cell.col)"
      @select="selectCell(cell.row, cell.col)"
      :class="getCellBorderClasses(cell.row, cell.col)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import type { SudokuSize } from '../../types/constants';
import type { SudokuBoard as SudokuBoardType, SudokuCell as SudokuCellType } from '../../types/sudoku';
import SudokuCell from './SudokuCell.vue';

// 定义一组更明显的背景颜色
const bgColors = [
  'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100',
  'bg-purple-100', 'bg-indigo-100', 'bg-red-100', 'bg-orange-100', 'bg-teal-100'
];

const props = defineProps({
  size: {
    type: Number,
    default: 9
  },
  puzzle: {
    type: Array,
    required: true
  },
  userInput: {
    type: Array,
    required: true
  },
  notes: {
    type: Array,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Number,
    default: null
  },
  selectedCol: {
    type: Number,
    default: null
  },
  highlightedValue: {
    type: Number,
    default: null
  },
  conflicts: {
    type: Array,
    default: () => []
  }
});

const gameStore = useGameStore();

// 将二维数组扁平化为一维数组，方便渲染
const flattenedBoard = computed(() => {
  const flattened: SudokuCellType[] = [];
  if (!gameStore.board || gameStore.board.length === 0) {
    return flattened;
  }
  
  for (let row = 0; row < props.size; row++) {
    for (let col = 0; col < props.size; col++) {
      if (gameStore.board[row] && gameStore.board[row][col]) {
        flattened.push(gameStore.board[row][col]);
      }
    }
  }
  return flattened;
});

// 选择单元格
const selectCell = (row: number, col: number) => {
  gameStore.selectCell(row, col);
};

// 检查单元格是否被选中
const isSelected = (row: number, col: number) => {
  return gameStore.selectedCell?.row === row && gameStore.selectedCell?.col === col;
};

// 检查单元格是否与选中单元格值相同
const isSameValue = (cell: SudokuCellType) => {
  if (!gameStore.selectedCell || !gameStore.currentCell?.value || cell.value === null) {
    return false;
  }
  return cell.value === gameStore.currentCell.value;
};

// 获取单元格背景颜色
const getCellBackgroundColor = (row: number, col: number) => {
  if (!gameStore.board[row] || !gameStore.board[row][col]) return '';

  // 根据区域索引分配颜色
  const regionIndex = gameStore.board[row][col].region;

  // 使用区域索引来选择颜色，确保相邻区域颜色不同
  // 使用更明显的颜色
  return bgColors[regionIndex % bgColors.length];
};

// 检查单元格是否是冲突单元格
const isConflictCell = (row: number, col: number) => {
  return gameStore.conflictCells.some(cell => cell.row === row && cell.col === col);
};

// 获取单元格边框样式
const getCellBorderClasses = (row: number, col: number) => {
  const classes = [];

  // 根据不同尺寸设置不同的边框
  if (props.size === 9) {
    // 9x9数独，3x3区域
    if (row % 3 === 0 && row !== 0) classes.push('border-t-2', 'border-t-gray-800');
    if (col % 3 === 0 && col !== 0) classes.push('border-l-2', 'border-l-gray-800');
  } else if (props.size === 6) {
    // 6x6数独，2x3区域
    if (row % 2 === 0 && row !== 0) classes.push('border-t-2', 'border-t-gray-800');
    if (col % 3 === 0 && col !== 0) classes.push('border-l-2', 'border-l-gray-800');
  } else if (props.size === 8) {
    // 8x8数独，2x4区域
    if (row % 2 === 0 && row !== 0) classes.push('border-t-2', 'border-t-gray-800');
    if (col % 4 === 0 && col !== 0) classes.push('border-l-2', 'border-l-gray-800');
  } else if (props.size === 4) {
    // 4x4数独，2x2区域
    if (row % 2 === 0 && row !== 0) classes.push('border-t-2', 'border-t-gray-800');
    if (col % 2 === 0 && col !== 0) classes.push('border-l-2', 'border-l-gray-800');
  }

  return classes;
};

// 触摸相关变量
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchStartTime = ref(0);
const touchedCell = ref<{row: number, col: number} | null>(null);

// 处理触摸开始事件
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return;
  
  touchStartX.value = event.touches[0].clientX;
  touchStartY.value = event.touches[0].clientY;
  touchStartTime.value = Date.now();
  
  // 获取触摸的单元格
  const element = document.elementFromPoint(touchStartX.value, touchStartY.value);
  if (element && element.closest('.sudoku-cell')) {
    const cell = element.closest('.sudoku-cell');
    const rowAttr = cell?.getAttribute('data-row');
    const colAttr = cell?.getAttribute('data-col');
    
    if (rowAttr !== null && colAttr !== null) {
      touchedCell.value = {
        row: parseInt(rowAttr),
        col: parseInt(colAttr)
      };
    }
  }
};

// 处理触摸移动事件
const handleTouchMove = (event: TouchEvent) => {
  // 实现滑动选择逻辑（可选）
};

// 处理触摸结束事件
const handleTouchEnd = (event: TouchEvent) => {
  // 检测是否为快速滑动
  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime.value;
  
  // 如果是快速滑动，可以实现特殊操作
  if (touchDuration < 300) {
    // 快速滑动操作
  }
};
</script>

<style scoped>
/* 根据不同尺寸设置不同的边框样式 */
.sudoku-board {
  display: grid;
  gap: 1px;
  border: 4px solid #333;
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .sudoku-board {
    gap: 0.5px;
    border-width: 3px;
  }
}
</style>
