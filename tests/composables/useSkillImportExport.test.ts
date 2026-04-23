import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSkillImportExport } from '../../entrypoints/sidebar/composables/useSkillImportExport'
import type { Skill } from '../../types'

vi.mock('element-plus/es', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const createMockSkill = (): Skill => ({
  id: 'test-skill',
  name: 'Test Skill',
  description: 'A test skill',
  systemPrompt: 'Test prompt',
  metadata: {
    author: 'Test',
    version: '1.0.0',
    tags: ['test'],
    examples: [],
    category: 'Test',
  },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
})

describe('useSkillImportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportSkills', () => {
    it('should create blob and trigger download', async () => {
      const { exportSkills } = useSkillImportExport()
      const mockSkills = [createMockSkill()]
      const getSkills = vi.fn().mockResolvedValue(mockSkills)

      URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
      URL.revokeObjectURL = vi.fn()

      await exportSkills(getSkills)

      expect(getSkills).toHaveBeenCalled()
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
    })

    it('should handle export error', async () => {
      const { exportSkills } = useSkillImportExport()
      const getSkills = vi.fn().mockRejectedValue(new Error('Export failed'))

      await exportSkills(getSkills)

      expect(getSkills).toHaveBeenCalled()
    })
  })

  describe('importSkills', () => {
    it('should handle successful import', async () => {
      const onImportSuccess = vi.fn().mockResolvedValue(undefined)
      const { importSkills } = useSkillImportExport(onImportSuccess)
      const importHandler = vi.fn().mockResolvedValue(undefined)

      const mockFile = new File([JSON.stringify([createMockSkill()])], 'skills.json', {
        type: 'application/json',
      })

      const inputElement = {
        type: 'file',
        accept: '.json',
        click: vi.fn(),
        onchange: null as any,
      } as any

      vi.spyOn(document, 'createElement').mockReturnValue(inputElement)

      await importSkills(importHandler)

      expect(inputElement.click).toHaveBeenCalled()
      expect(inputElement.accept).toBe('.json')

      const event = { target: { files: [mockFile] } }
      if (inputElement.onchange) {
        await inputElement.onchange(event)
      }
    })

    it('should handle import with no file', async () => {
      const { importSkills } = useSkillImportExport()
      const importHandler = vi.fn().mockResolvedValue(undefined)

      const inputElement = {
        type: 'file',
        accept: '.json',
        click: vi.fn(),
        onchange: null as any,
      } as any

      vi.spyOn(document, 'createElement').mockReturnValue(inputElement)

      await importSkills(importHandler)

      expect(importHandler).not.toHaveBeenCalled()
    })

    it('should handle invalid JSON file', async () => {
      const { importSkills } = useSkillImportExport()
      const importHandler = vi.fn().mockResolvedValue(undefined)

      const inputElement = {
        type: 'file',
        accept: '.json',
        click: vi.fn(),
        onchange: null as any,
      } as any

      vi.spyOn(document, 'createElement').mockReturnValue(inputElement)

      await importSkills(importHandler)

      expect(inputElement.click).toHaveBeenCalled()
    })
  })
})
