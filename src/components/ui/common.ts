import type { RoundedSize, ControlSize } from './types'

/** 圆角尺寸 class 映射 */
export const ROUNDED_CLASSES: Record<RoundedSize, string> = {
  none: 'rounded-ax-none',
  xs: 'rounded-ax-xs',
  sm: 'rounded-ax-sm',
  md: 'rounded-ax-md',
  lg: 'rounded-ax-lg',
  xl: 'rounded-ax-xl',
  full: 'rounded-ax-full',
}

/** 控件通用尺寸 class（xs / sm / md / lg / xl） */
export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
  xs: 'h-[18px] px-1.5 py-px text-body-sm',
  sm: 'h-5 px-2 py-0.5 text-body-sm',
  md: 'h-6 px-2.5 py-1 text-label-md',
  lg: 'h-7 px-3 py-1.5 text-label-md',
  xl: 'h-8 px-3.5 py-2 text-label-md',
}
