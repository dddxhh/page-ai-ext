import { storage } from './storage'
import { Skill } from '../types'
import { BUILT_IN_SKILLS } from '../skills/built-in-skills'

class SkillManager {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    const existingSkills = await storage.getAllSkills()
    const existingIds = new Set(existingSkills.map((s) => s.id))

    for (const skill of BUILT_IN_SKILLS) {
      if (!existingIds.has(skill.id)) {
        await storage.saveSkill(skill)
      }
    }

    this.initialized = true
  }

  async getAllSkills(): Promise<Skill[]> {
    await this.initialize()
    return await storage.getAllSkills()
  }

  async getSkill(id: string): Promise<Skill | null> {
    await this.initialize()
    return await storage.getSkill(id)
  }

  async saveSkill(skill: Skill): Promise<void> {
    await this.initialize()
    await storage.saveSkill(skill)
  }

  async deleteSkill(id: string): Promise<void> {
    await this.initialize()
    await storage.deleteSkill(id)
  }

  async importSkills(skills: Skill[]): Promise<void> {
    await this.initialize()
    await storage.importSkills(skills)
  }

  async exportSkills(): Promise<Skill[]> {
    await this.initialize()
    return await storage.exportSkills()
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const skills = await this.getAllSkills()
    const lowerQuery = query.toLowerCase()

    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const skills = await this.getAllSkills()
    return skills.filter((skill) => skill.metadata.category === category)
  }

  async toggleSkillEnabled(id: string): Promise<void> {
    await this.initialize()
    const skill = await storage.getSkill(id)
    if (!skill) return

    const updatedSkill = {
      ...skill,
      enabled: !skill.enabled,
      updatedAt: Date.now(),
    }
    await storage.saveSkill(updatedSkill)
  }
}

export const skillManager = new SkillManager()
