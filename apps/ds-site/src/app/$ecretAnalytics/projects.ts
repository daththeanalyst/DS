export interface Project {
  slug: string
  name: string
  pathPrefix: string
  url: string
  description: string
}

export const PROJECTS: Project[] = [
  {
    slug: 'megagym',
    name: 'MegaGym',
    pathPrefix: '/MegaGym-Website',
    url: 'ds2-consulting.com/MegaGym-Website',
    description: 'Fitness centre — Athens',
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}
