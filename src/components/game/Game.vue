<template>
  <div class="game-container">
    <div class="game-wrapper" :class="{ 'mobile': isMobile }">
      <!-- 游戏控制面板 -->
      <GameControls 
        :show-number-pad="isMobile" 
        :is-mobile="isMobile"
      />

      <!-- 数独游戏板 -->
      <div class="board-wrapper">
        <SudokuBoard 
          :size="size" 
          :puzzle="puzzle" 
          :user-input="userInput" 
          :notes="notes"
          :is-completed="isCompleted"
          :is-paused="isPaused"
          :selected-row="selectedRow"
          :selected-col="selectedCol"
          :highlighted-value="highlightedValue || undefined"
          :conflicts="conflicts"
          @cell-click="handleCellClick"
        />
      </div>

      <!-- 移动端数字键盘 -->
      <div v-if="isMobile" class="number-pad-container">
        <NumberPad 
          :size="size" 
          :note-mode="noteMode"
          :class="getNumberPadClass(size)"
          :show-function-buttons="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import SudokuBoard from '../board/SudokuBoard.vue';
import GameControls from '../controls/GameControls.vue';
import NumberPad from '../controls/NumberPad.vue';

const gameStore = useGameStore();

// 移动端检测
const isMobile = ref(false);

// 获取游戏状态
const size = computed(() => gameStore.size);
const puzzle = computed(() => gameStore.puzzle);
const userInput = computed(() => gameStore.userInput);
const notes = computed(() => gameStore.notes);
const isCompleted = computed(() => gameStore.isCompleted);
const isPaused = computed(() => gameStore.isPaused);
const selectedRow = computed(() => gameStore.selectedCell?.row);
const selectedCol = computed(() => gameStore.selectedCell?.col);
const highlightedValue = computed(() => gameStore.currentCell?.value);
const conflicts = computed(() => []);
const noteMode = computed(() => gameStore.noteMode);

// 处理单元格点击
const handleCellClick = (row: number, col: number) => {
  gameStore.selectCell(row, col);
};

// 根据尺寸获取数字键盘的CSS类
const getNumberPadClass = (size: number) => {
  if (size <= 6) {
    return 'number-pad-small';
  } else {
    return 'number-pad-large';
  }
};

// 检测设备是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 设置自定义视口高度变量
const setVhVariable = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// 监听窗口大小变化
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // 设置视口高度变量
  setVhVariable();
  window.addEventListener('load', setVhVariable);
  window.addEventListener('resize', setVhVariable);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('load', setVhVariable);
  window.removeEventListener('resize', setVhVariable);
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
}

.game-wrapper {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
}

.game-wrapper.mobile {
  gap: 0.75rem;
}

.board-wrapper {
  width: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
}

.number-pad-container {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}

.number-pad-small {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.number-pad-large {
  display: grid;
  margin: 0 auto;
}

/* 自定义视口高度变量 */
:root {
  --vh: 1vh;
}

@media (max-width: 767px) {
  .game-container {
    padding: 0;
    height: 100%;
    justify-content: center;
  }
  
  .game-wrapper {
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .board-wrapper {
    flex-grow: 0;
    margin: 0;
    padding: 0;
  }
  
  .number-pad-container {
    margin: 0;
    padding: 0;
    position: relative;
  }
}
</style>
