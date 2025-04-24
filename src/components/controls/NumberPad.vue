<template>
  <div class="number-pad">
    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
      <button
        v-for="num in numbers"
        :key="num"
        class="number-button flex items-center justify-center text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        :class="{ 'bg-blue-100 hover:bg-blue-200': noteMode }"
        @click="fillNumber(num)"
      >
        {{ num }}
      </button>

      <button
        class="number-button flex items-center justify-center text-lg font-medium bg-red-100 hover:bg-red-200 rounded-md transition-colors"
        @click="fillNumber(null)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        :class="{ 'bg-blue-100 hover:bg-blue-200': noteMode }"
        @click="toggleNoteMode"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          笔记模式
        </div>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        @click="undo"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a4 4 0 0 1 0 8H9m-6-8l3-3m0 0L3 4m3 3H3" />
          </svg>
          撤销
        </div>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        @click="getHint"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          提示
        </div>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import Button from '../ui/Button.vue';

const props = defineProps({
  size: {
    type: Number,
    default: 9
  }
});

const gameStore = useGameStore();

// 可用的数字
const numbers = computed(() => {
  return Array.from({ length: props.size }, (_, i) => i + 1);
});

// 是否处于笔记模式
const noteMode = computed(() => gameStore.noteMode);

// 填入数字
const fillNumber = (num: number | null) => {
  if (num === null) {
    // 清除当前单元格
    if (gameStore.currentCell) {
      gameStore.fillNumber(gameStore.currentCell.value || 0);
    }
  } else {
    gameStore.fillNumber(num);
  }
};

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
.number-button {
  aspect-ratio: 1 / 1;
  min-width: 40px;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .number-pad {
    max-width: 320px;
    margin: 0 auto;
  }

  .number-button {
    height: 45px;
    min-width: 45px;
  }
}
</style>
