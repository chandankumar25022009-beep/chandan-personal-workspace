export function isAdminPath(pathname: string, baseUrl: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const routePath = normalizedBase !== '/' && pathname.startsWith(normalizedBase)
    ? `/${pathname.slice(normalizedBase.length)}`
    : pathname
  return routePath === '/admin' || routePath.startsWith('/admin/')
}
