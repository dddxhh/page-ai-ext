<template>
  <el-dialog
    v-model="visible"
    title="Add Custom Model"
    width="500px"
    @close="handleClose"
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
import { ref } from 'vue';
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

function handleSubmit(): void {
  if (!form.value.name || !form.value.model || !form.value.apiKey) {
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

  emit('add', model);
  handleClose();
}

function handleClose(): void {
  emit('close');
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
</script>
