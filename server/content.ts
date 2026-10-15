import { z } from 'zod'

const text = (max = 4000) => z.string().trim().max(max)
const urlOrEmpty = z.string().trim().max(2048).refine((value) => value === '' || /^https:\/\//i.test(value), 'Use an HTTPS URL')
const id = z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/)

export const contentSchema = z.object({
  schemaVersion: z.literal(1),
  profile: z.object({
    name: text(120).min(1),
    headline: text(220).min(1),
    intro: text(1200),
    about: text(4000),
    location: text(180),
    social: z.object({ github: urlOrEmpty, linkedin: urlOrEmpty }).strict(),
  }).strict(),
  education: z.array(z.object({ id, title: text(180).min(1), institution: text(240), location: text(180), period: text(80), status: text(80), detail: text(240) }).strict()).max(20),
  skills: z.array(z.object({ id, name: text(120).min(1), category: text(100), status: z.enum(['Learning', 'Beginner', 'Planned', 'Completed', 'In Progress']) }).strict()).max(100),
  projects: z.array(z.object({ id, name: text(160).min(1), problem: text(1200), description: text(2000), technologies: z.array(text(80)).max(20), dataset: text(500), findings: text(1200), githubUrl: urlOrEmpty, demoUrl: urlOrEmpty, status: z.enum(['Planned', 'In Progress', 'Completed']), published: z.boolean() }).strict()).max(50),
  certificates: z.array(z.object({ id, title: text(180).min(1), issuer: text(180), date: text(80), fileUrl: urlOrEmpty, storagePath: text(240).nullable().optional(), verificationUrl: urlOrEmpty, published: z.boolean() }).strict()).max(50),
  journey: z.array(z.object({ id, title: text(180).min(1), status: z.enum(['Learning', 'Beginner', 'Planned', 'Completed', 'In Progress']), detail: text(1000) }).strict()).max(50),
  resume: z.object({ url: urlOrEmpty.nullable(), label: text(80).min(1), isPublic: z.boolean(), storagePath: text(240).nullable() }).strict(),
  contact: z.object({ email: z.union([z.string().email().max(254), z.null()]), note: text(180) }).strict(),
  settings: z.object({ title: text(120).min(1), description: text(300), defaultTheme: z.enum(['dark', 'light']) }).strict(),
}).strict()

export type ValidatedContent = z.infer<typeof contentSchema>
