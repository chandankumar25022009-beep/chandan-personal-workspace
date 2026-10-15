import type { PortfolioContent } from '../src/data/types'

export function preparePublicContent(source: PortfolioContent) {
  const content = structuredClone(source)
  content.projects = content.projects.filter((project) => project.published)
  content.certificates = content.certificates.filter((certificate) => certificate.published)

  const resumePath = content.resume.isPublic ? content.resume.storagePath : null
  if (!content.resume.isPublic || resumePath) content.resume.url = null
  content.resume.storagePath = null

  const certificateFiles: Array<{ id: string; path: string }> = []
  content.certificates = content.certificates.map((certificate) => {
    if (certificate.storagePath) {
      certificateFiles.push({ id: certificate.id, path: certificate.storagePath })
      return { ...certificate, fileUrl: '', storagePath: null }
    }
    return { ...certificate, storagePath: null }
  })

  return { content, resumePath, certificateFiles }
}
