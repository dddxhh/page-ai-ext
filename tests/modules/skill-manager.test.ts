import { describe, it, expect, beforeEach, vi } from 'vitest'
import { skillManager } from '../../modules/skill-manager'
import { Skill } from '../../types'
import { mockSkill } from '../fixtures/data-fixtures'

const mockGetAllSkills = vi.hoisted(() => vi.fn())
const mockGetSkill = vi.hoisted(() => vi.fn())
const mockSaveSkill = vi.hoisted(() => vi.fn())
const mockDeleteSkill = vi.hoisted(() => vi.fn())
const mockImportSkills = vi.hoisted(() => vi.fn())
const mockExportSkills = vi.hoisted(() => vi.fn())

vi.mock('../../modules/storage', () => ({
  storage: {
    getAllSkills: mockGetAllSkills,
    getSkill: mockGetSkill,
    saveSkill: mockSaveSkill,
    deleteSkill: mockDeleteSkill,
    importSkills: mockImportSkills,
    exportSkills: mockExportSkills,
  },
}))

vi.mock('../../skills/built-in-skills', () => ({
  BUILT_IN_SKILLS: [
    {
      id: 'built-in-1',
      name: 'Built-in Skill 1',
      description: 'A built-in skill',
      systemPrompt: 'Test prompt',
      metadata: {
        author: 'System',
        version: '1.0.0',
        tags: ['built-in'],
        examples: [],
        category: 'System',
      },
      isBuiltIn: true,
      enabled: true,
      createdAt: Date.now(),
    },
  ],
}))

describe('SkillManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(skillManager as any).initialized = false
    mockGetAllSkills.mockResolvedValue([])
    mockGetSkill.mockResolvedValue(null)
    mockSaveSkill.mockResolvedValue(undefined)
    mockDeleteSkill.mockResolvedValue(undefined)
    mockImportSkills.mockResolvedValue(undefined)
    mockExportSkills.mockResolvedValue([])
  })

  describe('initialize', () => {
    it('should save built-in skills on first init', async () => {
      mockGetAllSkills.mockResolvedValue([])

      await skillManager.initialize()

      expect(mockSaveSkill).toHaveBeenCalled()
    })

    it('should not save built-in skills if already exist', async () => {
      mockGetAllSkills.mockResolvedValue([
        {
          id: 'built-in-1',
          name: 'Built-in Skill 1',
          description: 'A built-in skill',
          systemPrompt: 'Test prompt',
          metadata: {
            author: 'System',
            version: '1.0.0',
            tags: ['built-in'],
            examples: [],
            category: 'System',
          },
          isBuiltIn: true,
          enabled: true,
          createdAt: Date.now(),
        },
      ])

      await skillManager.initialize()

      expect(mockSaveSkill).not.toHaveBeenCalled()
    })

    it('should skip initialization if already initialized', async () => {
      mockGetAllSkills.mockResolvedValue([])

      await skillManager.initialize()
      await skillManager.initialize()

      expect(mockGetAllSkills).toHaveBeenCalledTimes(1)
    })
  })

  describe('getAllSkills', () => {
    it('should return all skills after initialization', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const skills = await skillManager.getAllSkills()

      expect(mockGetAllSkills).toHaveBeenCalled()
      expect(skills).toHaveLength(1)
    })

    it('should initialize before returning skills', async () => {
      mockGetAllSkills.mockResolvedValueOnce([]).mockResolvedValueOnce([mockSkill])

      await skillManager.getAllSkills()

      expect(mockSaveSkill).toHaveBeenCalled()
    })
  })

  describe('getSkill', () => {
    it('should return skill by id', async () => {
      mockGetAllSkills.mockResolvedValue([])
      mockGetSkill.mockResolvedValue(mockSkill)

      const skill = await skillManager.getSkill(mockSkill.id)

      expect(mockGetSkill).toHaveBeenCalledWith(mockSkill.id)
      expect(skill).toEqual(mockSkill)
    })

    it('should return null for non-existent skill', async () => {
      mockGetAllSkills.mockResolvedValue([])
      mockGetSkill.mockResolvedValue(null)

      const skill = await skillManager.getSkill('non-existent')

      expect(skill).toBeNull()
    })

    it('should initialize before getting skill', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.getSkill('test')

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })

  describe('saveSkill', () => {
    it('should save custom skill', async () => {
      mockGetAllSkills.mockResolvedValue([])

      await skillManager.saveSkill(mockSkill)

      expect(mockSaveSkill).toHaveBeenCalledWith(mockSkill)
    })

    it('should initialize before saving', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.saveSkill(mockSkill)

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })

  describe('deleteSkill', () => {
    it('should delete skill by id', async () => {
      mockGetAllSkills.mockResolvedValue([])

      await skillManager.deleteSkill(mockSkill.id)

      expect(mockDeleteSkill).toHaveBeenCalledWith(mockSkill.id)
    })

    it('should initialize before deleting', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.deleteSkill('test')

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })

  describe('importSkills', () => {
    it('should import skills', async () => {
      mockGetAllSkills.mockResolvedValue([])

      await skillManager.importSkills([mockSkill])

      expect(mockImportSkills).toHaveBeenCalledWith([mockSkill])
    })

    it('should initialize before importing', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.importSkills([])

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })

  describe('exportSkills', () => {
    it('should export all skills', async () => {
      mockGetAllSkills.mockResolvedValue([])
      mockExportSkills.mockResolvedValue([mockSkill])

      const skills = await skillManager.exportSkills()

      expect(mockExportSkills).toHaveBeenCalled()
      expect(skills).toHaveLength(1)
    })

    it('should initialize before exporting', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.exportSkills()

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })

  describe('searchSkills', () => {
    it('should search by name', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('Test')

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe(mockSkill.name)
    })

    it('should search by description', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('unit testing')

      expect(results).toHaveLength(1)
    })

    it('should search by tags', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('helper')

      expect(results).toHaveLength(1)
    })

    it('should return empty for no matches', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should be case-insensitive', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('TEST')

      expect(results).toHaveLength(1)
    })

    it('should match partial text', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.searchSkills('Test Ski')

      expect(results).toHaveLength(1)
    })
  })

  describe('getSkillsByCategory', () => {
    it('should filter by category', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.getSkillsByCategory('general')

      expect(results).toHaveLength(1)
    })

    it('should return empty for non-existent category', async () => {
      mockGetAllSkills.mockResolvedValue([mockSkill])

      const results = await skillManager.getSkillsByCategory('nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should return multiple skills in same category', async () => {
      const skill2: Skill = {
        ...mockSkill,
        id: 'skill-2',
        name: 'Another Skill',
      }
      mockGetAllSkills.mockResolvedValue([mockSkill, skill2])

      const results = await skillManager.getSkillsByCategory('general')

      expect(results).toHaveLength(2)
    })
  })

  describe('toggleSkillEnabled', () => {
    it('should toggle skill from enabled to disabled', async () => {
      mockGetAllSkills.mockResolvedValue([])
      mockGetSkill.mockResolvedValue(mockSkill)

      await skillManager.toggleSkillEnabled(mockSkill.id)

      expect(mockGetSkill).toHaveBeenCalledWith(mockSkill.id)
      expect(mockSaveSkill).toHaveBeenCalledWith({
        ...mockSkill,
        enabled: false,
        updatedAt: expect.any(Number),
      })
    })

    it('should toggle skill from disabled to enabled', async () => {
      const disabledSkill = { ...mockSkill, enabled: false }
      mockGetAllSkills.mockResolvedValue([])
      mockGetSkill.mockResolvedValue(disabledSkill)

      await skillManager.toggleSkillEnabled(disabledSkill.id)

      expect(mockSaveSkill).toHaveBeenCalledWith({
        ...disabledSkill,
        enabled: true,
        updatedAt: expect.any(Number),
      })
    })

    it('should do nothing if skill not found', async () => {
      mockGetAllSkills.mockResolvedValue([
        {
          id: 'built-in-1',
          name: 'Built-in Skill 1',
          description: 'A built-in skill',
          systemPrompt: 'Test prompt',
          metadata: {
            author: 'System',
            version: '1.0.0',
            tags: ['built-in'],
            examples: [],
            category: 'System',
          },
          isBuiltIn: true,
          enabled: true,
          createdAt: Date.now(),
        },
      ])
      mockGetSkill.mockResolvedValue(null)

      await skillManager.toggleSkillEnabled('non-existent')

      expect(mockGetSkill).toHaveBeenCalledWith('non-existent')
    })

    it('should initialize before toggling', async () => {
      mockGetAllSkills.mockResolvedValueOnce([])

      await skillManager.toggleSkillEnabled('test')

      expect(mockGetAllSkills).toHaveBeenCalled()
    })
  })
})
