import { describe, it, expect } from 'vitest'
import { useMarkdown } from '../../entrypoints/sidebar/composables/useMarkdown'

describe('useMarkdown', () => {
  const { renderMarkdown, parseYamlFrontMatter, renderSkillDescription, renderSkillPreview } =
    useMarkdown()

  describe('renderMarkdown', () => {
    it('should render plain text as paragraph', () => {
      const result = renderMarkdown('Hello World')
      expect(result).toContain('Hello World')
      expect(result).toContain('<p>')
    })

    it('should render markdown headers', () => {
      const result = renderMarkdown('# Title')
      expect(result).toContain('<h1')
      expect(result).toContain('Title')
    })

    it('should render markdown code blocks', () => {
      const result = renderMarkdown('```\ncode\n```')
      expect(result).toContain('<pre>')
      expect(result).toContain('code')
    })

    it('should sanitize malicious content', () => {
      const malicious = '<script>alert("xss")</script>Hello'
      const result = renderMarkdown(malicious)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello')
    })

    it('should return empty string for empty input', () => {
      expect(renderMarkdown('')).toBe('')
      expect(renderMarkdown(null as any)).toBe('')
    })
  })

  describe('parseYamlFrontMatter', () => {
    it('should parse valid yaml front matter', () => {
      const input = `---
name: Test Skill
author: Test Author
---
This is the description.`
      const result = parseYamlFrontMatter(input)
      expect(result.hasYaml).toBe(true)
      expect(result.metadata.name).toBe('Test Skill')
      expect(result.metadata.author).toBe('Test Author')
      expect(result.bodyHtml).toContain('description')
    })

    it('should return no yaml for plain text', () => {
      const input = 'Just plain text without yaml'
      const result = parseYamlFrontMatter(input)
      expect(result.hasYaml).toBe(false)
      expect(result.metadata).toEqual({})
      expect(result.bodyHtml).toContain('plain text')
    })

    it('should handle invalid yaml gracefully', () => {
      const input = `---
invalid: yaml: content
---
Body text`
      const result = parseYamlFrontMatter(input)
      expect(result.hasYaml).toBe(false)
    })

    it('should handle empty input', () => {
      const result = parseYamlFrontMatter('')
      expect(result.hasYaml).toBe(false)
      expect(result.bodyHtml).toBe('')
    })
  })

  describe('renderSkillDescription', () => {
    it('should render yaml inline for front matter', () => {
      const input = `---
name: Test
category: Demo
---
Description text.`
      const result = renderSkillDescription(input)
      expect(result).toContain('yaml-inline')
      expect(result).toContain('yaml-key')
      expect(result).toContain('name:')
      expect(result).toContain('Test')
    })

    it('should render plain markdown without yaml', () => {
      const result = renderSkillDescription('Just **bold** text')
      expect(result).toContain('<strong>')
      expect(result).toContain('bold')
      expect(result).not.toContain('yaml-inline')
    })
  })

  describe('renderSkillPreview', () => {
    it('should render yaml front matter and system prompt', () => {
      const skill = {
        name: 'Test Skill',
        description: 'A test skill',
        systemPrompt: '# Instructions\n\nDo something.',
        metadata: {
          author: 'Test',
          version: '1.0.0',
          tags: ['test'],
          examples: [],
          category: 'Test',
        },
      }
      const result = renderSkillPreview(skill)
      expect(result).toContain('yaml-front-matter')
      expect(result).toContain('Test Skill')
      expect(result).toContain('<h1')
      expect(result).toContain('Instructions')
    })

    it('should handle empty system prompt', () => {
      const skill = {
        name: 'Test',
        description: 'Desc',
        systemPrompt: '',
        metadata: { author: '', version: '', tags: [], examples: [], category: '' },
      }
      const result = renderSkillPreview(skill)
      expect(result).toContain('yaml-front-matter')
      expect(result).toContain('Test')
    })
  })
})
