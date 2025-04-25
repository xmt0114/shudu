<template>
  <div
    class="sudoku-cell flex items-center justify-center relative"
    :class="[
      'border border-gray-300',
      cell.isGiven ? 'font-bold' : '',
      cell.isError ? 'text-red-500' : '',
      cell.isHighlighted ? 'bg-blue-100' : '',
      isSelected ? 'bg-blue-200 ring-2 ring-blue-500' : '',
      isSameValue ? 'bg-blue-50' : '',
      hasAnimation ? 'animate-hint' : '',
      bgColor
    ]"
    @click="$emit('select')"
  >
    <!-- 单元格值 -->
    <span v-if="cell.value" class="text-lg md:text-xl">
      {{ cell.value }}
    </span>

    <!-- 笔记 -->
    <div v-else-if="cell.notes.length > 0" class="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
      <div
        v-for="i in maxValue"
        :key="i"
        class="flex items-center justify-center text-xs text-gray-500"
      >
        {{ cell.notes.includes(i) ? i : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import type { SudokuCell } from '../../types/sudoku';

const gameStore = useGameStore();

const props = defineProps({
  cell: {
    type: Object as () => SudokuCell,
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isSameValue: {
    type: Boolean,
    default: false
  },
  maxValue: {
    type: Number,
    default: 9
  },
  bgColor: {
    type: String,
    default: ''
  }
});

// 检查当前单元格是否有动画
const hasAnimation = computed(() => {
  return gameStore.cellAnimation && 
         gameStore.cellAnimation.row === props.row && 
         gameStore.cellAnimation.col === props.col;
});

defineEmits(['select']);
</script>

<style scoped>
.sudoku-cell {
  aspect-ratio: 1 / 1;
  cursor: pointer;
  user-select: none;
}

@keyframes hint-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); background-color: rgba(74, 222, 128, 0.5); }
  100% { transform: scale(1); }
}

.animate-hint {
  animation: hint-animation 0.5s ease;
}
</style>
