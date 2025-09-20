// Common types for stores
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  roles: Role[]
  permissions: Permission[]
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
  conditions?: Record<string, any>
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

export interface ModalState {
  id: string
  isOpen: boolean
  data?: any
}