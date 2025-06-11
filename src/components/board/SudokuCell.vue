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
      isConflict ? 'animate-conflict text-red-500' : '',
      bgColor
    ]"
    @click="$emit('select')"
    @touchstart="handleTouchStart"
    :data-row="row"
    :data-col="col"
  >
    <!-- 单元格值 -->
    <span v-if="cell.value" :class="{
      'text-xl md:text-2xl': maxValue <= 4,
      'text-lg md:text-xl': maxValue > 4 && maxValue <= 6,
      'text-base md:text-lg': maxValue > 6
    }">
      {{ cell.value }}
    </span>

    <!-- 笔记 -->
    <div v-else-if="cell.notes.length > 0" class="grid w-full h-full p-0.5"
      :class="{
        'grid-cols-2': maxValue <= 4,
        'grid-cols-3': maxValue > 4
      }">
      <div
        v-for="i in maxValue"
        :key="i"
        class="flex items-center justify-center text-gray-500"
        :class="{
          'text-xs': maxValue <= 6,
          'text-2xs': maxValue > 6
        }"
      >
        {{ cell.notes.includes(i) ? i : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SudokuCell } from '../../types/sudoku';

defineProps({
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
  isConflict: {
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
  return false; // 暂时禁用动画，后续可以基于需求实现
});

// 处理触摸事件，提供更好的触摸反馈
const handleTouchStart = (event: TouchEvent) => {
  // 防止长按出现上下文菜单
  event.preventDefault();
  
  // 添加触摸反馈
  const element = event.currentTarget as HTMLElement;
  element.classList.add('touch-feedback');
  
  // 200ms后移除效果
  setTimeout(() => {
    element.classList.remove('touch-feedback');
  }, 200);
  
  // 确保选择事件触发
  emit('select');
};

// 定义emit
const emit = defineEmits(['select']);
</script>

<style scoped>
.sudoku-cell {
  aspect-ratio: 1 / 1;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation; /* 优化触摸操作 */
  -webkit-tap-highlight-color: transparent; /* 移除iOS点击高亮 */
}

/* 添加触摸反馈效果 */
.touch-feedback {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 更小的字体大小 */
.text-2xs {
  font-size: 0.65rem;
}

@keyframes hint-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); background-color: rgba(74, 222, 128, 0.5); }
  100% { transform: scale(1); }
}

.animate-hint {
  animation: hint-animation 0.5s ease;
}

@keyframes conflict-animation {
  0% { transform: scale(1); }
  33% { transform: scale(1.1); background-color: rgba(239, 68, 68, 0.5); }
  66% { transform: scale(1); background-color: rgba(239, 68, 68, 0.3); }
  100% { transform: scale(1.1); background-color: rgba(239, 68, 68, 0.5); }
}

.animate-conflict {
  animation: conflict-animation 1s ease 3;
}

/* 增强移动端的触摸体验 */
@media (max-width: 640px) {
  .sudoku-cell {
    min-height: 36px; /* 确保最小触摸区域 */
  }
}
</style>
