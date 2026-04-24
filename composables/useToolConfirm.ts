import { ref } from 'vue'
import type { ConfirmRequest } from '~/types/mcp-tools'

const sessionAllowedTools = ref<Set<string>>(new Set())

export function useToolConfirm() {
  const pendingConfirm = ref<ConfirmRequest | null>(null)
  const confirmCallback = ref<((confirmed: boolean, sessionAllow?: string) => void) | null>(null)

  function requestConfirm(
    request: ConfirmRequest,
    callback: (confirmed: boolean, sessionAllow?: string) => void
  ): void {
    if (sessionAllowedTools.value.has(request.tool)) {
      callback(true)
      return
    }

    pendingConfirm.value = request
    confirmCallback.value = callback
  }

  function handleConfirm(confirmed: boolean, sessionAllow?: string): void {
    if (confirmed && sessionAllow) {
      sessionAllowedTools.value.add(sessionAllow)
    }

    if (confirmCallback.value) {
      confirmCallback.value(confirmed, sessionAllow)
    }

    pendingConfirm.value = null
    confirmCallback.value = null
  }

  function cancelConfirm(): void {
    if (confirmCallback.value) {
      confirmCallback.value(false)
    }
    pendingConfirm.value = null
    confirmCallback.value = null
  }

  function isSessionAllowed(tool: string): boolean {
    return sessionAllowedTools.value.has(tool)
  }

  function clearSessionAllowed(): void {
    sessionAllowedTools.value.clear()
  }

  return {
    pendingConfirm,
    requestConfirm,
    handleConfirm,
    cancelConfirm,
    isSessionAllowed,
    clearSessionAllowed,
  }
}
