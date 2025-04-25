<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from './stores/gameStore';
import Game from './components/game/Game.vue';
import Notification from './components/ui/Notification.vue';

const gameStore = useGameStore();
const notification = computed(() => gameStore.notification);
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">数独游戏</h1>
      <p class="text-gray-600">挑战你的逻辑思维能力</p>
    </header>

    <main>
      <Game />
    </main>
    
    <!-- 通知组件 -->
    <Notification
      :message="notification.message"
      :type="notification.type"
      :visible="notification.visible"
      :duration="10000"
      @update:visible="gameStore.notification.visible = $event"
    />

    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>© 2025 数独游戏 - 一个有趣的数字拼图游戏</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 */
</style>
