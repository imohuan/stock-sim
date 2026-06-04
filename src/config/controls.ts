/**
 * 股票交易系统 — 控件统一配置
 * 所有 Ax 组件共享的默认 size/rounded 从这里引用
 */
import type { ControlSize, RoundedSize } from '@ui/types'

/** 统一尺寸 */
export const CTRL_SIZE: ControlSize = 'lg'

/** 统一圆角 */
export const CTRL_ROUNDED: RoundedSize = 'md'

/** AxSelect 最小宽度 */
export const SELECT_MIN_WIDTH = '120px'

/** 默认刷新间隔（秒） */
export const DEFAULT_REFRESH_INTERVAL = 3

/** 可用刷新间隔选项（下拉选择） */
export const REFRESH_INTERVAL_OPTIONS = [
  { value: 1, label: '1秒' },
  { value: 2, label: '2秒' },
  { value: 3, label: '3秒' },
  { value: 5, label: '5秒' },
  { value: 10, label: '10秒' },
  { value: 30, label: '30秒' },
  { value: 60, label: '60秒' },
]
