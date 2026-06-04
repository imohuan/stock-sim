export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-lg'
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AlertType = 'info' | 'error' | 'success' | 'warning'
export type RoundedSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface SelectOption {
  value: string | number
  label: string
}

export type PropPanelFieldType =
  | 'switch'
  | 'input'
  | 'slider'
  | 'select'
  | 'textarea'
  | 'segmented'

export interface PropPanelSchemaItem {
  key: string
  label: string
  description?: string
  type: PropPanelFieldType
  options?: SelectOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  rows?: number
}

export type PropPanelModel = Record<string, unknown>
