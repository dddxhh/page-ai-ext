<template>
  <el-dialog
    v-model="visible"
    :title="t('model.selectModel')"
    width="600px"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('model.builtinModels')" name="builtin">
        <div class="model-list">
          <div
            v-for="model in builtinModels"
            :key="model.id"
            :class="['model-item', { active: currentModelId === model.id }]"
          >
            <div class="model-info" @click="selectModel(model)">
              <h4>{{ model.name }}</h4>
              <p>{{ model.description }}</p>
            </div>
            <div class="model-actions">
              <el-tag :type="hasApiKey(model.id) ? 'success' : 'warning'" size="small">
                {{ hasApiKey(model.id) ? t('model.configured') : t('model.notConfigured') }}
              </el-tag>
              <el-button
                size="small"
                @click="handleConfigureModel(model)"
              >
                {{ hasApiKey(model.id) ? t('model.editKey') : t('model.configure') }}
              </el-button>
              <el-tag type="success" v-if="currentModelId === model.id" size="small">
                {{ t('model.active') }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="t('model.customModels')" name="custom">
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
                {{ t('model.select') }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteModel(model.id)"
              >
                {{ t('model.delete') }}
              </el-button>
            </el-button-group>
          </div>
        </div>

        <el-button
          type="primary"
          @click="handleShowAddModel"
        >
          {{ t('model.addCustomModel') }}
        </el-button>
      </el-tab-pane>
    </el-tabs>

    <AddModelDialog
      v-model:visible="showAddModel"
      @add="handleAddModel"
    />

    <el-dialog
      v-model="showApiKeyDialog"
      :title="t('model.enterApiKey')"
      width="400px"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item :label="t('model.model')">
          <el-input :value="pendingModel?.name" disabled />
        </el-form-item>
        <el-form-item :label="t('model.apiKey')" required>
          <el-input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-..."
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApiKeyDialog = false">{{ t('model.cancel') }}</el-button>
        <el-button type="primary" @click="saveApiKey">{{ t('model.save') }}</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="handleClose">{{ t('model.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import { storage } from '~/modules/storage';
import { ModelConfig, Config } from '~/types';
import AddModelDialog from './AddModelDialog.vue';

const visible = defineModel<boolean>('visible', { default: false });
const activeTab = ref('builtin');
const showAddModel = ref(false);
const showApiKeyDialog = ref(false);
const apiKeyInput = ref('');
const pendingModel = ref<ModelConfig | null>(null);
const currentModelId = ref('');
const customModels = ref<ModelConfig[]>([]);
const modelApiKeys = ref<Record<string, string>>({});

const builtinModelIds = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'deepseek-chat', 'deepseek-coder'];

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
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek Chat model for general conversation',
    provider: 'deepseek' as const,
    model: 'deepseek-chat',
    apiKey: '',
    parameters: {}
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'DeepSeek Coder model for code tasks',
    provider: 'deepseek' as const,
    model: 'deepseek-coder',
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
  
  for (const model of config.models) {
    if (model.apiKey) {
      modelApiKeys.value[model.id] = model.apiKey;
    }
  }
});

function hasApiKey(modelId: string): boolean {
  return !!modelApiKeys.value[modelId];
}

function handleConfigureModel(model: ModelConfig): void {
  pendingModel.value = model;
  apiKeyInput.value = modelApiKeys.value[model.id] || '';
  showApiKeyDialog.value = true;
}

async function saveApiKey(): Promise<void> {
  if (!apiKeyInput.value || !pendingModel.value) {
    ElMessage.error(t('model.fillRequired'));
    return;
  }

  const config = await storage.getConfig();
  const existingIndex = config.models.findIndex(m => m.id === pendingModel.value!.id);
  
  const modelWithKey: ModelConfig = {
    ...pendingModel.value!,
    apiKey: apiKeyInput.value
  };

  if (existingIndex >= 0) {
    config.models[existingIndex] = modelWithKey;
  } else {
    config.models.push(modelWithKey);
  }

  await storage.updateConfig({ models: config.models });
  modelApiKeys.value[pendingModel.value!.id] = apiKeyInput.value;
  
  showApiKeyDialog.value = false;
  ElMessage.success(t('model.apiKeySaved'));
}

async function selectModel(model: ModelConfig): Promise<void> {
  if (!hasApiKey(model.id)) {
    handleConfigureModel(model);
    return;
  }
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
    ElMessage.success(t('model.modelAdded'));
  } catch (error) {
    ElMessage.error(t('model.modelAddFailed'));
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
  transition: all 0.2s;
}

.model-item:hover,
.model-item.active {
  background: #f5f5f5;
  border-color: #409eff;
}

.model-info {
  flex: 1;
  cursor: pointer;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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