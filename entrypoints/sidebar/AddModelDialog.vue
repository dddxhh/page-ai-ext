<template>
  <el-dialog
    v-model="visible"
    title="Add Custom Model"
    width="500px"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="Name" required>
        <el-input v-model="form.name" placeholder="My Custom Model" />
      </el-form-item>

      <el-form-item label="Provider" required>
        <el-select v-model="form.provider">
          <el-option label="OpenAI" value="openai" />
          <el-option label="Anthropic" value="anthropic" />
          <el-option label="Google" value="google" />
          <el-option label="Custom" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="Base URL" v-if="form.provider === 'custom'">
        <el-input
          v-model="form.baseURL"
          placeholder="https://api.example.com/v1"
        />
      </el-form-item>

      <el-form-item label="Model" required>
        <el-input
          v-model="form.model"
          placeholder="gpt-4"
        />
      </el-form-item>

      <el-form-item label="API Key" required>
        <el-input
          v-model="form.apiKey"
          type="password"
          placeholder="sk-..."
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Add</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { ModelConfig } from '~/types';

const visible = defineModel<boolean>('visible', { default: false });
const form = ref<Partial<ModelConfig>>({
  name: '',
  provider: 'openai',
  baseURL: '',
  model: '',
  apiKey: '',
  parameters: {}
});

const emit = defineEmits<{
  close: [];
  add: [model: ModelConfig];
}>();

watch(visible, (newVal) => {
  console.log('AddModelDialog visible changed to:', newVal);
  if (!newVal) {
    resetForm();
  }
});

function handleSubmit(): void {
  console.log('handleSubmit called, form:', form.value);
  if (!form.value.name || !form.value.model || !form.value.apiKey) {
    ElMessage.error('Please fill in all required fields');
    return;
  }

  const model: ModelConfig = {
    id: generateId(),
    name: form.value.name!,
    provider: form.value.provider!,
    baseURL: form.value.baseURL,
    model: form.value.model!,
    apiKey: form.value.apiKey!,
    parameters: {}
  };

  console.log('Emitting add event with model:', model);
  emit('add', model);
  visible.value = false;
}

function handleClose(): void {
  console.log('handleClose called');
  visible.value = false;
}

function resetForm(): void {
  console.log('resetForm called');
  form.value = {
    name: '',
    provider: 'openai',
    baseURL: '',
    model: '',
    apiKey: '',
    parameters: {}
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
</script>
