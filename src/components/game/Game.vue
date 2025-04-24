<template>
  <div class="game-container">
    <!-- PC布局：控制元素在上方 -->
    <div class="hidden lg:block">
      <div class="flex flex-col gap-6">
        <!-- 游戏控制 -->
        <div class="w-full">
          <GameControls :show-number-pad="false" />
        </div>

        <!-- 游戏棋盘 -->
        <div class="flex justify-center">
          <div class="w-full max-w-md">
            <SudokuBoard
              :board="board"
              :size="size"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端布局：控制元素在下方，保留数字键盘 -->
    <div class="lg:hidden">
      <div class="flex flex-col gap-6">
        <!-- 游戏棋盘 -->
        <div class="flex justify-center">
          <div class="w-full max-w-md">
            <SudokuBoard
              :board="board"
              :size="size"
            />
          </div>
        </div>

        <!-- 游戏控制 -->
        <div class="w-full">
          <GameControls :show-number-pad="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import type { SudokuSize, DifficultyLevel } from '../../types/constants';
import SudokuBoard from '../board/SudokuBoard.vue';
import GameControls from '../controls/GameControls.vue';

const gameStore = useGameStore();

// 游戏状态
const board = computed(() => gameStore.board);
const size = computed(() => gameStore.size);

// 初始化游戏
onMounted(() => {
  gameStore.startNewGame(9, 'medium');
});
</script>

<style scoped>
.game-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
