export default function getKeyDescription(key: string): string {
  if (key === ' ') {
    return 'space'
  }
  return key
}
