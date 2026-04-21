/**
 * 生成随机 ID
 * @returns 13 位随机字符串
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * 基于 name 生成 ID（用于 skill 等需要可读性的场景）
 * @param name - 名称
 * @returns 格式化的 ID（如 "my-skill-abc123"）
 */
export function generateIdFromName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}
