<template>
  <div class="game-controls bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
    <!-- PC模式下的布局 -->
    <div v-if="!showNumberPad" class="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
      <div class="flex items-center gap-3 mb-2 sm:mb-0">
        <div class="text-lg font-semibold">
          {{ difficultyText }}
        </div>
        <div class="text-lg font-mono">
          {{ formattedTime }}
        </div>
      </div>

      <div class="flex flex-wrap gap-2 justify-center">
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
    <div v-else class="w-full">
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

    <!-- 数字键盘 - 仅在移动端显示 -->
    <NumberPad v-if="showNumberPad" :size="size" />
    
    <!-- 功能按钮 - 在PC端也显示 -->
    <div v-if="!showNumberPad" class="mt-4 flex flex-wrap gap-2 justify-center w-full">
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
        :disabled="!canUndo"
        :class="{ 'opacity-50 cursor-not-allowed': !canUndo }"
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
        :disabled="!canUseHint"
        :class="{ 'opacity-50 cursor-not-allowed': !canUseHint }"
        @click="getHint"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          提示 ({{ hintsRemaining }}/{{ maxHints }})
        </div>
      </Button>
    </div>

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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import { SUDOKU_SIZES, DIFFICULTY_LEVELS } from '../../types/constants';
import type { DifficultyLevel, SudokuSize } from '../../types/constants';
import Button from '../ui/Button.vue';
import Modal from '../ui/Modal.vue';
import NumberPad from './NumberPad.vue';
import { ElMessage } from 'element-plus';

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
const noteMode = computed(() => gameStore.noteMode);
const hintsRemaining = computed(() => gameStore.hintsRemaining);
const maxHints = computed(() => gameStore.maxHints);
const canUseHint = computed(() => gameStore.canUseHint());
const canUndo = computed(() => gameStore.canUndo());

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
  if (!canUseHint.value) {
    ElMessage.warning('提示次数已用完');
    return;
  }
  gameStore.getHint();
};

// 键盘事件处理 - 支持PC端使用硬件键盘输入数字
const handleKeyDown = (event: KeyboardEvent) => {
  // 如果游戏暂停、已完成或处于移动模式，不处理键盘事件
  if (isPaused.value || isCompleted.value || props.showNumberPad) return;
  
  const key = event.key;
  
  // 数字键 1-9
  if (/^[1-9]$/.test(key) && parseInt(key) <= size.value) {
    gameStore.fillNumber(parseInt(key));
  }
  // 删除键或退格键 - 清除当前单元格
  else if (key === 'Delete' || key === 'Backspace') {
    // 使用currentCell getter获取当前单元格的值
    const currentCell = gameStore.currentCell;
    if (currentCell && currentCell.value !== null) {
      gameStore.fillNumber(currentCell.value);
    }
  }
  // N 键 - 切换笔记模式
  else if (key.toLowerCase() === 'n') {
    toggleNoteMode();
  }
  // Z 键 + Ctrl - 撤销
  else if (key.toLowerCase() === 'z' && event.ctrlKey) {
    undo();
  }
  // H 键 - 提示
  else if (key.toLowerCase() === 'h') {
    getHint();
  }
};

// 添加和移除键盘事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 更新游戏时间
setInterval(() => {
  gameStore.updateTime();
}, 1000);
</script>
