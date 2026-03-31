<template>
  <el-dialog
    v-model="visible"
    title="Select Model"
    width="600px"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Built-in Models" name="builtin">
        <div class="model-list">
          <div
            v-for="model in builtinModels"
            :key="model.id"
            :class="['model-item', { active: currentModelId === model.id }]"
            @click="selectModel(model)"
          >
            <div class="model-info">
              <h4>{{ model.name }}</h4>
              <p>{{ model.description }}</p>
            </div>
            <el-tag type="success" v-if="currentModelId === model.id">
              Active
            </el-tag>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Custom Models" name="custom">
        <div class="model-list">
          <div
            v-for="model in customModels"
            :key="model.id"
            :class="['model-item', { active: currentModelId === model.id }]"
          >
            <div class="model-info">
              <h4>{{ model.name }}</h4>
              <p>{{ model.provider }} - {{ model.model }}</p>
            </div>
            <el-button-group>
              <el-button
                size="small"
                @click="selectModel(model)"
              >
                Select
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteModel(model.id)"
              >
                Delete
              </el-button>
            </el-button-group>
          </div>
        </div>

        <el-button
          type="primary"
          @click="handleShowAddModel"
        >
          Add Custom Model
        </el-button>
      </el-tab-pane>
    </el-tabs>

    <AddModelDialog
      v-model:visible="showAddModel"
      @add="handleAddModel"
    />

    <template #footer>
      <el-button @click="handleClose">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { storage } from '~/modules/storage';
import { ModelConfig, Config } from '~/types';
import AddModelDialog from './AddModelDialog.vue';

const visible = defineModel<boolean>('visible', { default: false });
const activeTab = ref('builtin');
const showAddModel = ref(false);
const currentModelId = ref('');
const customModels = ref<ModelConfig[]>([]);

const builtinModelIds = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus'];

const builtinModels = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI GPT-4 model',
    provider: 'openai' as const,
    model: 'gpt-4',
    apiKey: '',
    parameters: {}
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'OpenAI GPT-3.5 Turbo model',
    provider: 'openai' as const,
    model: 'gpt-3.5-turbo',
    apiKey: '',
    parameters: {}
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropic Claude 3 Opus model',
    provider: 'anthropic' as const,
    model: 'claude-3-opus-20240229',
    apiKey: '',
    parameters: {}
  }
];

const emit = defineEmits<{
  close: [];
}>();

onMounted(async () => {
  const config = await storage.getConfig();
  currentModelId.value = config.currentModelId;
  customModels.value = config.models.filter(m => !builtinModelIds.includes(m.id));
});

async function selectModel(model: ModelConfig): Promise<void> {
  await storage.updateConfig({ currentModelId: model.id });
  currentModelId.value = model.id;
}

async function deleteModel(modelId: string): Promise<void> {
  const config = await storage.getConfig();
  const updatedModels = config.models.filter(m => m.id !== modelId);
  await storage.updateConfig({ models: updatedModels });
  customModels.value = updatedModels.filter(m => !builtinModelIds.includes(m.id));
}

async function handleAddModel(model: ModelConfig): Promise<void> {
  console.log('handleAddModel called with:', model);
  try {
    const config = await storage.getConfig();
    const updatedModels = [...config.models, model];
    await storage.updateConfig({ models: updatedModels });
    customModels.value = updatedModels.filter(m => !builtinModelIds.includes(m.id));
    showAddModel.value = false;
    ElMessage.success('Model added successfully');
  } catch (error) {
    ElMessage.error('Failed to add model');
    console.error('Error adding model:', error);
  }
}

function handleShowAddModel(): void {
  console.log('handleShowAddModel called');
  showAddModel.value = true;
  console.log('showAddModel set to:', showAddModel.value);
}

function handleClose(): void {
  emit('close');
}
</script>

<style scoped>
.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.model-item:hover,
.model-item.active {
  background: #f5f5f5;
  border-color: #409eff;
}

.model-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.model-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
