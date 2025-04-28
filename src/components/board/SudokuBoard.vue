<template>
  <div
    class="sudoku-board max-w-md mx-auto w-full"
    :class="[
      size === 4 ? 'grid-cols-4' :
      size === 6 ? 'grid-cols-6' :
      size === 8 ? 'grid-cols-8' :
      'grid-cols-9'
    ]"
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
  board: {
    type: Array as () => SudokuBoardType,
    required: true
  },
  size: {
    type: Number,
    default: 9
  }
});

const gameStore = useGameStore();

// 将二维数组扁平化为一维数组，方便渲染
const flattenedBoard = computed(() => {
  const flattened: SudokuCellType[] = [];
  for (let row = 0; row < props.size; row++) {
    for (let col = 0; col < props.size; col++) {
      if (props.board[row] && props.board[row][col]) {
        flattened.push(props.board[row][col]);
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
  if (!props.board[row] || !props.board[row][col]) return '';

  // 根据区域索引分配颜色
  const regionIndex = props.board[row][col].region;

  // 使用区域索引来选择颜色，确保相邻区域颜色不同
  // 使用更明显的颜色
  return bgColors[regionIndex % bgColors.length];
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
}
</style>
