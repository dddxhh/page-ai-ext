import { marked } from 'marked'
import DOMPurify from 'dompurify'
import yaml from 'js-yaml'

export interface YamlFrontMatterResult {
  metadata: Record<string, any>
  bodyHtml: string
  hasYaml: boolean
}

export function useMarkdown() {
  function renderMarkdown(text: string): string {
    if (!text) return ''
    const raw = marked.parse(text, { breaks: true, gfm: true }) as string
    return DOMPurify.sanitize(raw)
  }

  function parseYamlFrontMatter(description: string): YamlFrontMatterResult {
    if (!description) {
      return { metadata: {}, bodyHtml: '', hasYaml: false }
    }

    const yamlMatch = description.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

    if (!yamlMatch) {
      return {
        metadata: {},
        bodyHtml: renderMarkdown(description),
        hasYaml: false,
      }
    }

    try {
      const metadata = yaml.load(yamlMatch[1]) as Record<string, any>
      const markdownBody = yamlMatch[2]
      const bodyHtml = renderMarkdown(markdownBody)
      return { metadata, bodyHtml, hasYaml: true }
    } catch {
      return {
        metadata: {},
        bodyHtml: renderMarkdown(description),
        hasYaml: false,
      }
    }
  }

  function renderSkillDescription(description: string): string {
    const { metadata, bodyHtml, hasYaml } = parseYamlFrontMatter(description)

    if (!hasYaml) {
      return bodyHtml
    }

    const metadataHtml = Object.entries(metadata)
      .map(
        ([key, value]) =>
          `<span class="yaml-key">${key}:</span> <span class="yaml-value">${value}</span>`
      )
      .join(' | ')

    return `<div class="yaml-inline">${metadataHtml}</div>${bodyHtml}`
  }

  function generateYamlFrontMatterContent(skill: {
    name: string
    description: string
    metadata: {
      category?: string
      author?: string
      version?: string
      tags?: string[]
      examples?: string[]
    }
  }): string {
    const yamlFields: Record<string, any> = {
      name: skill.name,
      description: skill.description,
    }

    if (skill.metadata.category) yamlFields.category = skill.metadata.category
    if (skill.metadata.author) yamlFields.author = skill.metadata.author
    if (skill.metadata.version) yamlFields.version = skill.metadata.version
    if (skill.metadata.tags?.length) yamlFields.tags = skill.metadata.tags
    if (skill.metadata.examples?.length) yamlFields.examples = skill.metadata.examples

    const yamlContent = yaml.dump(yamlFields, { skipInvalid: true, indent: 2 })
    return `---\n${yamlContent}---`
  }

  function renderSkillPreview(skill: {
    name: string
    description: string
    systemPrompt: string
    metadata: {
      category?: string
      author?: string
      version?: string
      tags?: string[]
      examples?: string[]
    }
  }): string {
    const yamlFrontMatter = generateYamlFrontMatterContent(skill)
    const yamlHtml = `<pre class="yaml-front-matter"><code>${yamlFrontMatter}</code></pre>`
    const bodyHtml = skill.systemPrompt ? renderMarkdown(skill.systemPrompt) : ''
    return yamlHtml + bodyHtml
  }

  return {
    renderMarkdown,
    parseYamlFrontMatter,
    renderSkillDescription,
    generateYamlFrontMatterContent,
    renderSkillPreview,
  }
}
