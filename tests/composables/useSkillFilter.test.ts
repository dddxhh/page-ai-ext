import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSkillFilter } from '../../entrypoints/sidebar/composables/useSkillFilter'
import type { Skill } from '../../types'

const createMockSkill = (name: string, category: string, tags: string[] = []): Skill => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  name,
  description: `Description for ${name}`,
  systemPrompt: `Prompt for ${name}`,
  metadata: {
    author: 'Test',
    version: '1.0.0',
    tags,
    examples: [],
    category,
  },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
})

describe('useSkillFilter', () => {
  const mockSkills = ref<Skill[]>([
    createMockSkill('Code Review', 'Development', ['code', 'review']),
    createMockSkill('Code Generator', 'Development', ['code', 'generate']),
    createMockSkill('Translator', 'Language', ['translate', 'language']),
    createMockSkill('Writer', 'Language', ['write', 'content']),
  ])

  describe('categories', () => {
    it('should extract unique categories from skills', () => {
      const { categories } = useSkillFilter(mockSkills)
      expect(categories.value).toContain('Development')
      expect(categories.value).toContain('Language')
      expect(categories.value.length).toBe(2)
    })

    it('should return empty array for empty skills', () => {
      const { categories } = useSkillFilter(ref([]))
      expect(categories.value).toEqual([])
    })
  })

  describe('filteredSkills - search', () => {
    it('should filter by name', () => {
      const { searchQuery, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'Code'
      expect(filteredSkills.value.length).toBe(2)
      expect(filteredSkills.value.every((s) => s.name.includes('Code'))).toBe(true)
    })

    it('should filter by description', () => {
      const { searchQuery, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'Description for Translator'
      expect(filteredSkills.value.length).toBe(1)
      expect(filteredSkills.value[0].name).toBe('Translator')
    })

    it('should filter by tags', () => {
      const { searchQuery, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'translate'
      expect(filteredSkills.value.length).toBe(1)
      expect(filteredSkills.value[0].name).toBe('Translator')
    })

    it('should be case-insensitive', () => {
      const { searchQuery, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'CODE'
      expect(filteredSkills.value.length).toBe(2)
    })

    it('should return all skills when search is empty', () => {
      const { searchQuery, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = ''
      expect(filteredSkills.value.length).toBe(4)
    })
  })

  describe('filteredSkills - category', () => {
    it('should filter by category', () => {
      const { selectedCategory, filteredSkills } = useSkillFilter(mockSkills)
      selectedCategory.value = 'Development'
      expect(filteredSkills.value.length).toBe(2)
      expect(filteredSkills.value.every((s) => s.metadata.category === 'Development')).toBe(true)
    })

    it('should return all skills when category is empty', () => {
      const { selectedCategory, filteredSkills } = useSkillFilter(mockSkills)
      selectedCategory.value = ''
      expect(filteredSkills.value.length).toBe(4)
    })
  })

  describe('filteredSkills - combined', () => {
    it('should filter by both search and category', () => {
      const { searchQuery, selectedCategory, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'Generator'
      selectedCategory.value = 'Development'
      expect(filteredSkills.value.length).toBe(1)
      expect(filteredSkills.value[0].name).toBe('Code Generator')
    })

    it('should return empty when filters conflict', () => {
      const { searchQuery, selectedCategory, filteredSkills } = useSkillFilter(mockSkills)
      searchQuery.value = 'Translator'
      selectedCategory.value = 'Development'
      expect(filteredSkills.value.length).toBe(0)
    })
  })

  describe('clearSearch', () => {
    it('should reset search query and category', () => {
      const { searchQuery, selectedCategory, clearSearch } = useSkillFilter(mockSkills)
      searchQuery.value = 'test'
      selectedCategory.value = 'Development'
      clearSearch()
      expect(searchQuery.value).toBe('')
      expect(selectedCategory.value).toBe('')
    })
  })
})
