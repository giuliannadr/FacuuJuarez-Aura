import type { Role } from '@/lib/permissions'

export interface SessionProfile {
  id: string
  name: string
  email: string
  role: Role
  avatar_url: string | null
}

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: Role[]
}
