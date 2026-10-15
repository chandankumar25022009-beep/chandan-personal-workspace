export type ContentStatus = 'Learning' | 'Beginner' | 'Planned' | 'Completed' | 'In Progress'

export interface PortfolioContent {
  schemaVersion: number
  profile: {
    name: string
    headline: string
    intro: string
    about: string
    location: string
    social: { github: string; linkedin: string }
  }
  education: Array<{ id: string; title: string; institution: string; location: string; period: string; status: string; detail: string }>
  skills: Array<{ id: string; name: string; category: string; status: ContentStatus }>
  projects: Array<{ id: string; name: string; problem: string; description: string; technologies: string[]; dataset: string; findings: string; githubUrl: string; demoUrl: string; status: string; published: boolean }>
  certificates: Array<{ id: string; title: string; issuer: string; date: string; fileUrl: string; storagePath?: string | null; verificationUrl: string; published: boolean }>
  journey: Array<{ id: string; title: string; status: ContentStatus; detail: string }>
  resume: { url: string | null; label: string; isPublic: boolean; storagePath: string | null }
  contact: { email: string | null; note: string }
  settings: { title: string; description: string; defaultTheme: 'dark' | 'light' }
}
