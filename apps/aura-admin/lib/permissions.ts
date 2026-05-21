export type Role = 'facundo' | 'aura_admin' | 'aura_member'

export const ROLE_PERMISSIONS = {
  facundo: {
    canEditFacundoContent: true,
    canEditAuraContent: true,
    canManageTeam: true,
    canViewAllBookings: true,
    canViewMergedCalendar: true,
    canManageEvents: true, // crea y edita eventos de ambos contextos
  },
  aura_admin: {
    canEditFacundoContent: false,
    canEditAuraContent: true,
    canManageTeam: false,
    canViewAllBookings: true,
    canViewMergedCalendar: false,
    canManageEvents: true, // solo eventos de AURA
  },
  aura_member: {
    canEditFacundoContent: false,
    canEditAuraContent: false,
    canManageTeam: false,
    canViewAllBookings: false,
    canViewMergedCalendar: false,
    canManageEvents: false,
  },
} as const

export type Permission = keyof (typeof ROLE_PERMISSIONS)['facundo']

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`Role "${role}" does not have permission "${permission}"`)
  }
}

// Nav items cada rol puede ver
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['facundo', 'aura_admin', 'aura_member'] as Role[],
  },
  {
    label: 'Contenido — Facundo',
    href: '/content/facundo',
    icon: 'UserCircle',
    roles: ['facundo'] as Role[],
  },
  {
    label: 'Contenido — AURA',
    href: '/content/aura',
    icon: 'Building2',
    roles: ['facundo', 'aura_admin'] as Role[],
  },
  {
    label: 'Reservas',
    href: '/bookings',
    icon: 'CalendarDays',
    roles: ['facundo', 'aura_admin', 'aura_member'] as Role[],
  },
  {
    label: 'Mi disponibilidad',
    href: '/availability',
    icon: 'Clock',
    roles: ['facundo', 'aura_admin', 'aura_member'] as Role[],
  },
  {
    label: 'Eventos',
    href: '/events',
    icon: 'Sparkles',
    roles: ['facundo', 'aura_admin'] as Role[],
  },
  {
    label: 'Equipo',
    href: '/team',
    icon: 'Users',
    roles: ['facundo'] as Role[],
  },
  {
    label: 'Configuración',
    href: '/settings',
    icon: 'Settings',
    roles: ['facundo', 'aura_admin', 'aura_member'] as Role[],
  },
] as const
