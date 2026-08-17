/** Достаёт errorCodes из ApiError (см. api/client.ts), иначе {}. */
export function mapApiErrorCodes(e: unknown): Record<string, string> {
  if (e && typeof e === 'object' && 'errorCodes' in e) {
    const codes = (e as { errorCodes?: unknown }).errorCodes
    if (codes && typeof codes === 'object') return codes as Record<string, string>
  }
  return {}
}
