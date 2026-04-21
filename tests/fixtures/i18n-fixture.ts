import { createI18n } from 'vue-i18n'
import { messages, defaultLocale } from '../../entrypoints/sidebar/locales'

export function createTestI18n(locale = defaultLocale) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en-US',
    messages,
  })
}

export const testI18n = createTestI18n()
