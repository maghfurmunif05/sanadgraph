/**
 * Combines CSS classes dynamically.
 */
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).map(c => String(c).trim()).join(' ');
}

/**
 * Format timestamp or ISO string to readable localized date
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
