<template>
  <Teleport to="body">
    <div v-if="visible" class="notification" :class="type">
      <div class="notification-content">
        {{ message }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 10000
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

watch(() => props.visible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      emit('update:visible', false);
    }, props.duration);
  }
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: fadeIn 0.3s, fadeOut 0.5s ease-out forwards;
  animation-delay: 0s, calc(v-bind(props.duration) - 500)ms;
}

.info {
  background-color: #2196f3;
}

.success {
  background-color: #4caf50;
}

.warning {
  background-color: #ff9800;
}

.error {
  background-color: #f44336;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>