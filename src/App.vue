<script setup lang="ts">
import { useGameStore } from './stores/gameStore';
import Game from './components/game/Game.vue';
import { onMounted } from 'vue';

const gameStore = useGameStore();

// 在组件挂载时初始化游戏
onMounted(() => {
  // 默认开始一个 9x9 的中等难度游戏
  gameStore.startNewGame(9, 'medium');
});
</script>

<template>
  <div class="app-container">
    <header class="text-center mb-3">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">数独游戏</h1>
      <p class="text-lg text-gray-600">挑战你的逻辑思维能力</p>
    </header>

    <main class="main-content">
      <Game />
    </main>
    
    <footer class="text-center text-gray-500 text-sm py-3 mt-3">
      <p>© 2025 数独游戏</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f5f5f5;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 1rem 0;
}

@media (max-width: 767px) {
  .app-container {
    padding: 0.5rem;
  }
  
  header {
    margin-bottom: 1rem !important;
  }
  
  h1 {
    font-size: 2rem !important;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .main-content {
    margin: 0.5rem 0;
  }
  
  footer {
    padding: 0.75rem 0 !important;
    margin-top: 0.75rem;
  }
}
</style>
