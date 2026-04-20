import zhCN from './zh-CN'
import enUS from './en-US'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export type LocaleCode = 'zh-CN' | 'en-US'

export const defaultLocale: LocaleCode = 'zh-CN'

export function getLocaleMessages(locale: LocaleCode) {
  return messages[locale] || messages[defaultLocale]
}
