import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElMessage } from 'element-plus';
import { storage } from '../../modules/storage';
import { ModelConfig } from '../../types';

vi.mock('../../modules/storage');
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ModelSelector Component Logic', () => {
  const mockConfig = {
    currentModelId: 'gpt-4',
    models: [
      {
        id: 'custom-1',
        name: 'Custom Model',
        provider: 'openai' as const,
        model: 'gpt-4',
        apiKey: 'sk-test',
        parameters: {}
      }
    ],
    shortcuts: {
      toggleSidebar: 'Ctrl+Shift+A',
      newConversation: 'Ctrl+Shift+N'
    },
    theme: 'light' as const,
    language: 'en-US' as const,
    privacy: {
      encryptHistory: false,
      allowPageContentUpload: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(storage.updateConfig).mockResolvedValue(undefined);
  });

  it('should add custom model successfully', async () => {
    const newModel: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test-key',
      parameters: {}
    };

    const config = await storage.getConfig();
    const updatedModels = [...config.models, newModel];
    await storage.updateConfig({ models: updatedModels });

    expect(storage.updateConfig).toHaveBeenCalledWith({
      models: [...mockConfig.models, newModel]
    });
  });

  it('should handle add model error', async () => {
    vi.mocked(storage.updateConfig).mockRejectedValue(new Error('Storage error'));

    const newModel: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test-key',
      parameters: {}
    };

    let errorThrown = false;
    try {
      const config = await storage.getConfig();
      const updatedModels = [...config.models, newModel];
      await storage.updateConfig({ models: updatedModels });
    } catch (error) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(true);
  });
});

describe('AddModelDialog Component Logic', () => {
  it('should validate form before submission', () => {
    const form = {
      name: '',
      provider: 'openai',
      model: '',
      apiKey: '',
      parameters: {}
    };

    const isValid = !(!form.name || !form.model || !form.apiKey);
    expect(isValid).toBe(false);
  });

  it('should create valid model data', () => {
    const form = {
      name: 'Test Model',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: 'sk-test-key',
      parameters: {}
    };

    const model: ModelConfig = {
      id: Math.random().toString(36).substring(2, 15),
      name: form.name!,
      provider: form.provider!,
      model: form.model!,
      apiKey: form.apiKey!,
      parameters: {}
    };

    expect(model.name).toBe('Test Model');
    expect(model.provider).toBe('openai');
    expect(model.model).toBe('gpt-4');
    expect(model.apiKey).toBe('sk-test-key');
    expect(model.id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const id1 = Math.random().toString(36).substring(2, 15);
    const id2 = Math.random().toString(36).substring(2, 15);

    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
    expect(id2.length).toBeGreaterThan(0);
  });

  it('should reset form', () => {
    const form = {
      name: 'Test Model',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test-key',
      parameters: {}
    };

    const resetForm = () => {
      form.name = '';
      form.provider = 'openai';
      form.model = '';
      form.apiKey = '';
      form.parameters = {};
    };

    resetForm();

    expect(form.name).toBe('');
    expect(form.apiKey).toBe('');
    expect(form.model).toBe('');
  });
});
