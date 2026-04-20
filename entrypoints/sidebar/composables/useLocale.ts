import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storage } from '~/modules/storage'
import { LocaleCode, defaultLocale } from '../locales'

export function useLocale() {
  const { locale } = useI18n()
  const currentLocale = ref<LocaleCode>(defaultLocale)

  async function loadSavedLocale(): Promise<void> {
    try {
      const config = await storage.getConfig()
      if (config.language) {
        currentLocale.value = config.language
        locale.value = config.language
      }
    } catch (error) {
      console.error('Failed to load saved locale:', error)
    }
  }

  async function setLocale(newLocale: LocaleCode): Promise<void> {
    currentLocale.value = newLocale
    locale.value = newLocale

    try {
      await storage.updateConfig({ language: newLocale })
    } catch (error) {
      console.error('Failed to save locale:', error)
    }
  }

  watch(currentLocale, (newLocale) => {
    locale.value = newLocale
  })

  return {
    currentLocale,
    loadSavedLocale,
    setLocale,
  }
}
