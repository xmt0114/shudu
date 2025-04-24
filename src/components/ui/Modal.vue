<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('update:modelValue', false)"></div>
        
        <!-- 模态框内容 -->
        <div 
          class="bg-white rounded-lg shadow-xl z-10 max-w-md w-full max-h-[90vh] overflow-auto"
          :class="[size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md']"
        >
          <!-- 标题栏 -->
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <button 
              class="text-gray-500 hover:text-gray-700"
              @click="$emit('update:modelValue', false)"
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
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
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

defineEmits(['update:modelValue']);
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
</style>
