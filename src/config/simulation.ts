/**
 * 模拟回放统一配置
 * 模拟数据和真实数据共用这些参数
 */

/** 模拟起始天数（真实数据 = 第1条K线开始算起，模拟数据 = 历史第N天） */
export const SIM_INITIAL_DAYS = 1000

/** CLI 最大支持获取的日K线条数 */
export const CLI_MAX_KLINES = 2000

/** 模拟数据生成的总天数 */
export const MOCK_HISTORY_DAYS = 2000

/** 前端默认拉取的 K 线条数（≤ CLI_MAX_KLINES） */
export const FETCH_KLINES_LIMIT = 2000
