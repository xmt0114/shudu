<template>
  <div class="game-controls bg-white p-4 rounded-lg shadow-md">
    <!-- PC模式下的布局 -->
    <div v-if="!showNumberPad" class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="text-lg font-semibold">
          {{ difficultyText }}
        </div>
        <div class="text-lg font-mono">
          {{ formattedTime }}
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          @click="showNewGameModal = true"
        >
          新游戏
        </Button>

        <Button
          variant="secondary"
          size="sm"
          @click="togglePause"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          @click="checkErrors"
        >
          检查
        </Button>
      </div>
    </div>

    <!-- 移动端模式下的布局 -->
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <div class="text-lg font-semibold">
          {{ difficultyText }}
        </div>
        <div class="text-lg font-mono">
          {{ formattedTime }}
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <Button
          variant="primary"
          @click="showNewGameModal = true"
        >
          新游戏
        </Button>

        <Button
          variant="secondary"
          @click="togglePause"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </Button>

        <Button
          variant="secondary"
          @click="checkErrors"
        >
          检查
        </Button>
      </div>
    </div>

    <NumberPad v-if="showNumberPad" :size="size" />

    <!-- 新游戏模态框 -->
    <Modal
      v-model="showNewGameModal"
      title="开始新游戏"
    >
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-medium mb-2">选择尺寸</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="s in SUDOKU_SIZES"
              :key="s"
              class="px-3 py-2 rounded-md transition-colors"
              :class="selectedSize === s ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
              @click="selectedSize = s"
            >
              {{ s }}×{{ s }}
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-medium mb-2">选择难度</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="d in difficulties"
              :key="d.value"
              class="px-3 py-2 rounded-md transition-colors"
              :class="selectedDifficulty === d.value ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
              @click="selectedDifficulty = d.value"
            >
              {{ d.label }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          variant="secondary"
          @click="showNewGameModal = false"
        >
          取消
        </Button>
        <Button
          variant="primary"
          @click="startNewGame"
        >
          开始
        </Button>
      </template>
    </Modal>

    <!-- 游戏完成模态框 -->
    <Modal
      v-model="showCompletionModal"
      title="恭喜！"
    >
      <div class="text-center">
        <p class="text-lg mb-4">你已成功完成数独游戏！</p>
        <div class="mb-4">
          <p>难度: {{ difficultyText }}</p>
          <p>用时: {{ formattedTime }}</p>
        </div>
      </div>

      <template #footer>
        <Button
          variant="primary"
          @click="showNewGameModal = true"
        >
          新游戏
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import { SUDOKU_SIZES, DIFFICULTY_LEVELS } from '../../types/constants';
import type { DifficultyLevel, SudokuSize } from '../../types/constants';
import Button from '../ui/Button.vue';
import Modal from '../ui/Modal.vue';
import NumberPad from './NumberPad.vue';

const props = defineProps({
  showNumberPad: {
    type: Boolean,
    default: true
  }
});

const gameStore = useGameStore();

// 游戏状态
const isPaused = computed(() => gameStore.isPaused);
const isCompleted = computed(() => gameStore.isCompleted);
const formattedTime = computed(() => gameStore.formattedTime);
const size = computed(() => gameStore.size);

// 模态框状态
const showNewGameModal = ref(false);
const showCompletionModal = ref(false);

// 新游戏设置
const selectedSize = ref<SudokuSize>(9);
const selectedDifficulty = ref<DifficultyLevel>('medium');

// 难度选项
const difficulties = [
  { value: 'easy' as DifficultyLevel, label: '简单' },
  { value: 'medium' as DifficultyLevel, label: '中等' },
  { value: 'hard' as DifficultyLevel, label: '困难' },
  { value: 'expert' as DifficultyLevel, label: '专家' }
];

// 当前难度文本
const difficultyText = computed(() => {
  const difficulty = difficulties.find(d => d.value === gameStore.difficulty);
  return difficulty ? difficulty.label : '中等';
});

// 监听游戏完成状态
watch(() => gameStore.isCompleted, (newValue) => {
  if (newValue) {
    showCompletionModal.value = true;
  }
});

// 开始新游戏
const startNewGame = () => {
  gameStore.startNewGame(selectedSize.value, selectedDifficulty.value);
  showNewGameModal.value = false;
  showCompletionModal.value = false;
};

// 暂停/继续游戏
const togglePause = () => {
  gameStore.togglePause();
};

// 检查错误
const checkErrors = () => {
  gameStore.checkErrors();
};

// 更新游戏时间
setInterval(() => {
  gameStore.updateTime();
}, 1000);
</script>
