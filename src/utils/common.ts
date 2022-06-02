/**
 * 动态引入
 * @param url
 * @returns
 */
export function getImage(url: string): string {
  return new URL(`../assets/${url}`, import.meta.url).href;
}
