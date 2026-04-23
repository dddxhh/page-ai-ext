import { ElMessage } from 'element-plus/es'
import { useI18n } from 'vue-i18n'
import type { Skill } from '~/types'

export function useSkillImportExport(onImportSuccess?: () => Promise<void>) {
  const { t } = useI18n()

  async function exportSkills(getSkills: () => Promise<Skill[]>): Promise<void> {
    try {
      const skills = await getSkills()
      const blob = new Blob([JSON.stringify(skills, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skills.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export skills error:', error)
      ElMessage.error(t('skill.exportFailed') || '导出失败')
    }
  }

  async function importSkills(importHandler: (skills: Skill[]) => Promise<void>): Promise<void> {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const skills = JSON.parse(text) as Skill[]
        await importHandler(skills)
        ElMessage.success(t('settings.skillsImported') || '技能导入成功')
        if (onImportSuccess) {
          await onImportSuccess()
        }
      } catch (error) {
        console.error('Import skills error:', error)
        ElMessage.error(t('skill.importFailed') || '导入失败，请检查文件格式')
      }
    }

    input.click()
  }

  return {
    exportSkills,
    importSkills,
  }
}
