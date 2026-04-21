import { describe, it, expect } from 'vitest'
import { generateId, generateIdFromName } from '../../utils/id'

describe('ID Utils', () => {
  describe('generateId', () => {
    it('should generate a string of expected length range', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThanOrEqual(8)
      expect(id.length).toBeLessThanOrEqual(13)
    })

    it('should generate unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(100)
    })

    it('should only contain alphanumeric characters', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('generateIdFromName', () => {
    it('should generate valid ID from simple name', () => {
      const id = generateIdFromName('My Test Skill')
      expect(id).toMatch(/^[a-z]/)
      expect(id).toContain('my-test-skill')
    })

    it('should include timestamp suffix', () => {
      const id = generateIdFromName('Test')
      expect(id).toMatch(/-[a-z0-9]+$/)
    })

    it('should handle special characters', () => {
      const id = generateIdFromName('Test!@#$%Skill')
      expect(id).toMatch(/^[a-z]/)
      expect(id).not.toContain('!')
      expect(id).not.toContain('@')
      expect(id).not.toContain('#')
    })

    it('should handle leading/trailing hyphens', () => {
      const id = generateIdFromName('---Test---')
      expect(id).toMatch(/^test/)
      expect(id).not.toMatch(/^-/)
    })

    it('should truncate long names', () => {
      const longName = 'This is a very long name that exceeds the maximum length limit'
      const id = generateIdFromName(longName)
      const basePart = id.split('-')[0]
      expect(basePart.length).toBeLessThanOrEqual(20)
    })

    it('should convert to lowercase', () => {
      const id = generateIdFromName('UPPERCASE NAME')
      expect(id).toMatch(/^[a-z]/)
      expect(id).not.toContain(/[A-Z]/)
    })

    it('should handle empty name gracefully', () => {
      const id = generateIdFromName('')
      expect(id).toMatch(/^-[a-z0-9]+$/)
    })

    it('should handle name with only special characters', () => {
      const id = generateIdFromName('!@#$%')
      expect(id).toMatch(/^-[a-z0-9]+$/)
    })
  })
})
