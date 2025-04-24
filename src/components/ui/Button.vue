<template>
  <button
    :class="[
      'rounded-md font-medium transition-colors',
      size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
      variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
      variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' :
      variant === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' :
      variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' :
      'bg-gray-100 hover:bg-gray-200 text-gray-800',
      size === 'sm' ? 'text-sm' :
      size === 'lg' ? 'text-lg' :
      'text-base',
      fullWidth ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'success', 'danger', 'default'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>
