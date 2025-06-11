<template>
  <div class="number-pad" :class="{ 'note-mode': noteMode, 'size-large': size > 6 }">
    <div class="number-pad-container" :class="getContainerClass()">
      <button
        v-for="num in numbers"
        :key="num"
        class="number-button"
        :class="{
          'active': noteMode,
          'disabled': !canUseNumber(num)
        }"
        @click="fillNumber(num)"
        :disabled="!canUseNumber(num)"
      >
        {{ num }}
      </button>
      <button
        class="number-button clear-button"
        @click="clearCell"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 功能按钮 - 更紧凑的布局 -->
    <div v-if="showFunctionButtons" class="mt-2 flex justify-between gap-1">
      <button
        class="function-button flex items-center justify-center rounded-md transition-colors px-2 py-1 border shadow-sm active:shadow-inner"
        :class="noteMode ? 'bg-blue-200 hover:bg-blue-300 border-blue-400' : 'bg-white hover:bg-gray-100 border-gray-300'"
        @click="toggleNoteMode"
        title="笔记模式"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button
        class="function-button flex items-center justify-center rounded-md transition-colors px-2 py-1 border shadow-sm active:shadow-inner"
        :class="canUndo ? 'bg-white hover:bg-gray-100 border-gray-300' : 'bg-gray-100 opacity-50 cursor-not-allowed border-gray-300'"
        @click="undo"
        :disabled="!canUndo"
        title="撤销"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a4 4 0 0 1 0 8H9m-6-8l3-3m0 0L3 4m3 3H3" />
        </svg>
      </button>

      <button
        class="function-button flex items-center justify-center rounded-md transition-colors px-2 py-1 relative border shadow-sm active:shadow-inner"
        :class="canUseHint ? 'bg-white hover:bg-gray-100 border-gray-300' : 'bg-gray-100 opacity-50 cursor-not-allowed border-gray-300'"
        @click="getHint"
        :disabled="!canUseHint"
        title="提示"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {{ hintsRemaining }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

// 属性定义
const props = defineProps({
  size: {
    type: Number,
    required: true
  },
  noteMode: {
    type: Boolean,
    default: false
  },
  showFunctionButtons: {
    type: Boolean,
    default: true
  }
});

const gameStore = useGameStore();

// 根据数独尺寸生成可用数字
const numbers = computed(() => {
  return Array.from({ length: props.size }, (_, i) => i + 1);
});

// 检查数字是否可用
const canUseNumber = (_num: number) => {
  // 在数独游戏中，所有数字都可用
  return true;
};

// 填入数字
const fillNumber = (num: number) => {
  gameStore.fillNumber(num);
};

// 清除单元格
const clearCell = () => {
  gameStore.clearSelectedCell();
};

// 根据尺寸获取容器类名
const getContainerClass = () => {
  // 所有尺寸都使用单行布局
  return 'single-row';
};

// 是否可以撤销
const canUndo = computed(() => gameStore.canUndo());

// 是否可以使用提示
const canUseHint = computed(() => gameStore.canUseHint());

// 剩余提示次数
const hintsRemaining = computed(() => gameStore.hintsRemaining);

// 切换笔记模式
const toggleNoteMode = () => {
  gameStore.toggleNoteMode();
};

// 撤销操作
const undo = () => {
  gameStore.undo();
};

// 获取提示
const getHint = () => {
  gameStore.getHint();
};
</script>

<style scoped>
.number-pad {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  background-color: transparent;
  box-shadow: none;
}

.number-pad.note-mode {
  background-color: rgba(230, 247, 255, 0.5);
}

.number-pad-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.number-pad-container.single-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 0.75rem;
}

.number-pad-container.grid-layout {
  display: grid;
  gap: 1rem;
  justify-content: center;
}

.number-pad-container.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
  max-width: 300px;
  margin: 0 auto;
}

.number-pad-container.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
  max-width: 350px;
  margin: 0 auto;
}

.number-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.number-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.number-button:active {
  transform: translateY(0);
  background-color: #e8e8e8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.number-button.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.number-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-button {
  background-color: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}

.clear-button:hover {
  background-color: #fff1f0;
  color: #ff7875;
}

/* 移动端优化 */
@media (max-width: 767px) {
  .number-pad {
    padding: 0.5rem 0;
    background-color: transparent;
    box-shadow: none;
    max-width: 100%;
    width: 100%;
  }
  
  .number-pad-container {
    gap: 0.5rem;
    width: 100%;
    justify-content: space-between;
  }
  
  .number-pad-container.single-row {
    gap: 0.2rem;
    width: 100%;
    justify-content: space-between;
  }
  
  /* 根据数独尺寸调整按钮大小 */
  .number-button {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
    border-radius: 0.5rem;
  }
  
  /* 8宫和9宫的数独，按钮更小 */
  .size-large .number-button {
    width: 2.2rem;
    height: 2.2rem;
    font-size: 1.125rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .number-button {
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
  }
  
  .size-large .number-button {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 1rem;
  }
}

/* 确保9宫数独在小屏幕上正确显示 */
@media (max-width: 420px) {
  .size-large .number-button {
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
  }
  
  .number-pad-container.single-row {
    gap: 0.1rem;
  }
}

/* 确保在极小屏幕上也能显示 */
@media (max-width: 340px) {
  .size-large .number-button {
    width: 1.7rem;
    height: 1.7rem;
    font-size: 0.9rem;
  }
  
  .number-pad-container.single-row {
    gap: 0.05rem;
  }
}

.function-button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .number-pad {
    max-width: 320px;
    margin: 0 auto;
  }
  
  .number-pad.size-large {
    max-width: 350px;
  }
}
</style>
