import { STORAGE_KEYS, Config, Conversation, Skill } from '../types';

export class Storage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // Configuration
  async getConfig(): Promise<Config> {
    const config = await this.get<Config>(STORAGE_KEYS.CONFIG);
    if (config) return config;

    // Default config
    const defaultConfig: Config = {
      models: [],
      currentModelId: '',
      shortcuts: {
        toggleSidebar: 'Ctrl+Shift+A',
        newConversation: 'Ctrl+Shift+O'
      },
      theme: 'auto',
      language: 'zh-CN',
      privacy: {
        encryptHistory: false,
        allowPageContentUpload: true
      }
    };

    await this.set(STORAGE_KEYS.CONFIG, defaultConfig);
    return defaultConfig;
  }

  async updateConfig(updates: Partial<Config>): Promise<void> {
    const config = await this.getConfig();
    const updatedConfig = { ...config, ...updates };
    await this.set(STORAGE_KEYS.CONFIG, updatedConfig);
  }

  // Conversation management
  async saveConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const index = conversations.findIndex(c => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }

    await this.set(STORAGE_KEYS.CONVERSATIONS, conversations);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.find(c => c.id === id) || null;
  }

  async getConversationsByUrl(url: string): Promise<Conversation[]> {
    const conversations = await this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.filter(c => c.url === url);
  }

  async deleteConversation(id: string): Promise<void> {
    const conversations = await this.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const filtered = conversations.filter(c => c.id !== id);
    await this.set(STORAGE_KEYS.CONVERSATIONS, filtered);
  }

  // Skill management
  async saveSkill(skill: Skill): Promise<void> {
    const skills = await this.getAllSkills();
    const index = skills.findIndex(s => s.id === skill.id);

    if (index >= 0) {
      skills[index] = skill;
    } else {
      skills.push(skill);
    }

    await this.set(STORAGE_KEYS.SKILLS, skills);
  }

  async getSkill(id: string): Promise<Skill | null> {
    const skills = await this.getAllSkills();
    return skills.find(s => s.id === id) || null;
  }

  async getAllSkills(): Promise<Skill[]> {
    return await this.get<Skill[]>(STORAGE_KEYS.SKILLS) || [];
  }

  async deleteSkill(id: string): Promise<void> {
    const skills = await this.getAllSkills();
    const filtered = skills.filter(s => s.id !== id);
    await this.set(STORAGE_KEYS.SKILLS, filtered);
  }

  async importSkills(skills: Skill[]): Promise<void> {
    const existingSkills = await this.getAllSkills();
    const skillMap = new Map(existingSkills.map(s => [s.id, s]));

    for (const skill of skills) {
      if (!skillMap.has(skill.id)) {
        skillMap.set(skill.id, skill);
      }
    }

    await this.set(STORAGE_KEYS.SKILLS, Array.from(skillMap.values()));
  }

  async exportSkills(): Promise<Skill[]> {
    return await this.getAllSkills();
  }
}

export class StorageClass extends Storage {}

export const storage = new StorageClass();
