import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Storage } from '../../modules/storage'
import { STORAGE_KEYS } from '../../types'
import { mockConfig, mockConversation, mockSkill } from '../fixtures/data-fixtures'

describe('Storage Module', () => {
  let storage: Storage
  let mockGet: any
  let mockSet: any

  beforeEach(() => {
    storage = new Storage()
    mockGet = vi.fn().mockResolvedValue({})
    mockSet = vi.fn().mockResolvedValue(undefined)

    chrome.storage.local.get = mockGet
    chrome.storage.local.set = mockSet
    chrome.storage.local.remove = vi.fn().mockResolvedValue(undefined)
    chrome.storage.local.clear = vi.fn().mockResolvedValue(undefined)
  })

  describe('Basic Operations', () => {
    it('should get value from storage', async () => {
      const testData = { key: 'value' }
      mockGet.mockResolvedValue({ testKey: testData })

      const result = await storage.get('testKey')
      expect(result).toEqual(testData)
    })

    it('should return null for non-existent key', async () => {
      mockGet.mockResolvedValue({})

      const result = await storage.get('nonExistentKey')
      expect(result).toBeNull()
    })

    it('should set value to storage', async () => {
      const testData = { key: 'value' }
      await storage.set('testKey', testData)

      expect(mockSet).toHaveBeenCalledWith({ testKey: testData })
    })

    it('should delete value from storage', async () => {
      await storage.delete('testKey')

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('testKey')
    })

    it('should clear all storage', async () => {
      await storage.clear()

      expect(chrome.storage.local.clear).toHaveBeenCalled()
    })

    it('should handle storage errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('Storage error'))

      const result = await storage.get('testKey')
      expect(result).toBeNull()
    })
  })

  describe('Configuration Management', () => {
    it('should get config with defaults', async () => {
      mockGet.mockResolvedValue({})

      const config = await storage.getConfig()
      expect(config).toMatchObject({
        models: [],
        currentModelId: '',
        theme: 'auto',
        language: 'zh-CN',
      })
    })

    it('should return existing config', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONFIG]: mockConfig,
      })

      const config = await storage.getConfig()
      expect(config).toEqual(mockConfig)
    })

    it('should save default config on first access', async () => {
      mockGet.mockResolvedValue({})

      await storage.getConfig()

      expect(mockSet).toHaveBeenCalled()
      const setCall = mockSet.mock.calls[0]
      expect(setCall[0]).toHaveProperty(STORAGE_KEYS.CONFIG)
    })

    it('should update config partially', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONFIG]: mockConfig,
      })

      await storage.updateConfig({ theme: 'dark' })

      expect(mockSet).toHaveBeenCalled()
      const setCall = mockSet.mock.calls[0]
      expect(setCall[0][STORAGE_KEYS.CONFIG].theme).toBe('dark')
    })
  })

  describe('Conversation Management', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [],
      })
    })

    it('should save new conversation', async () => {
      await storage.saveConversation(mockConversation)

      expect(mockSet).toHaveBeenCalled()
      const setCall = mockSet.mock.calls[0]
      const conversations = setCall[0][STORAGE_KEYS.CONVERSATIONS]
      expect(conversations).toHaveLength(1)
      expect(conversations[0]).toEqual(mockConversation)
    })

    it('should update existing conversation', async () => {
      const updatedConversation = { ...mockConversation, title: 'Updated Title' }
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [mockConversation],
      })

      await storage.saveConversation(updatedConversation)

      const setCall = mockSet.mock.calls[0]
      const conversations = setCall[0][STORAGE_KEYS.CONVERSATIONS]
      expect(conversations[0].title).toBe('Updated Title')
    })

    it('should get conversation by id', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [mockConversation],
      })

      const result = await storage.getConversation(mockConversation.id)
      expect(result).toEqual(mockConversation)
    })

    it('should return null for non-existent conversation', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [mockConversation],
      })

      const result = await storage.getConversation('non-existent-id')
      expect(result).toBeNull()
    })

    it('should get conversations by URL', async () => {
      const conv2 = { ...mockConversation, id: 'conv-2', url: 'https://example.com/page2' }
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [mockConversation, conv2],
      })

      const result = await storage.getConversationsByUrl(mockConversation.url)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockConversation)
    })

    it('should delete conversation', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.CONVERSATIONS]: [mockConversation],
      })

      await storage.deleteConversation(mockConversation.id)

      const setCall = mockSet.mock.calls[0]
      const conversations = setCall[0][STORAGE_KEYS.CONVERSATIONS]
      expect(conversations).toHaveLength(0)
    })
  })

  describe('Skill Management', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [],
      })
    })

    it('should save new skill', async () => {
      await storage.saveSkill(mockSkill)

      expect(mockSet).toHaveBeenCalled()
      const setCall = mockSet.mock.calls[0]
      const skills = setCall[0][STORAGE_KEYS.SKILLS]
      expect(skills).toHaveLength(1)
      expect(skills[0]).toEqual(mockSkill)
    })

    it('should update existing skill', async () => {
      const updatedSkill = { ...mockSkill, name: 'Updated Skill' }
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      await storage.saveSkill(updatedSkill)

      const setCall = mockSet.mock.calls[0]
      const skills = setCall[0][STORAGE_KEYS.SKILLS]
      expect(skills[0].name).toBe('Updated Skill')
    })

    it('should get skill by id', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      const result = await storage.getSkill(mockSkill.id)
      expect(result).toEqual(mockSkill)
    })

    it('should return null for non-existent skill', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      const result = await storage.getSkill('non-existent-id')
      expect(result).toBeNull()
    })

    it('should get all skills', async () => {
      const skill2 = { ...mockSkill, id: 'skill-2' }
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill, skill2],
      })

      const result = await storage.getAllSkills()
      expect(result).toHaveLength(2)
    })

    it('should delete skill', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      await storage.deleteSkill(mockSkill.id)

      const setCall = mockSet.mock.calls[0]
      const skills = setCall[0][STORAGE_KEYS.SKILLS]
      expect(skills).toHaveLength(0)
    })

    it('should import skills without duplicates', async () => {
      const skill2 = { ...mockSkill, id: 'skill-2' }
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      await storage.importSkills([mockSkill, skill2])

      const setCall = mockSet.mock.calls[0]
      const skills = setCall[0][STORAGE_KEYS.SKILLS]
      expect(skills).toHaveLength(2)
    })

    it('should export all skills', async () => {
      mockGet.mockResolvedValue({
        [STORAGE_KEYS.SKILLS]: [mockSkill],
      })

      const result = await storage.exportSkills()
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockSkill)
    })
  })
})
