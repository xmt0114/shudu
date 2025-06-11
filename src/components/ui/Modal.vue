<template>
  <Transition name="modal" @after-leave="handleTransitionComplete">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        
        <!-- 模态框内容 -->
        <div 
          class="bg-white rounded-lg shadow-xl z-10 max-w-md w-full max-h-[90vh] overflow-auto modal-content"
          :class="[size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md']"
        >
          <!-- 标题栏 -->
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <button 
              class="text-gray-500 hover:text-gray-700"
              @click.stop="closeModal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- 内容区域 -->
          <div class="p-4">
            <slot></slot>
          </div>
          
          <!-- 底部按钮区域 -->
          <div v-if="$slots.footer" class="p-4 border-t flex justify-end space-x-2">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

// 添加调试信息，跟踪模态框状态变化
watch(() => props.modelValue, (newValue) => {
  console.log(`[Modal Debug] ${props.title} - 模态框状态变化:`, newValue ? '打开' : '关闭');
});

// 标记模态框是否正在关闭中
const isClosing = ref(false);

// 关闭模态框的方法
const closeModal = () => {
  if (isClosing.value) {
    console.log(`[Modal Debug] ${props.title} - 模态框正在关闭中，忽略重复点击`);
    return;
  }
  
  console.log(`[Modal Debug] ${props.title} - 尝试关闭模态框`);
  isClosing.value = true;
  emit('update:modelValue', false);
};

// 处理过渡动画完成事件
const handleTransitionComplete = () => {
  console.log(`[Modal Debug] ${props.title} - 过渡动画完成`);
  isClosing.value = false;
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 防止模态框内容区域的点击事件冒泡 */
.modal-content {
  pointer-events: auto;
}
</style>
