let counter = 0

export function createId(prefix: string): string {
  counter += 1
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}-${counter}`
  }
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}
