import type { StockInfo } from '../types/stock'

export const STOCK_LIST: StockInfo[] = [
  // 银行
  { code: '000001', name: '平安银行', market: 'sz', industry: '银行', basePrice: 11.25 },
  { code: '600000', name: '浦发银行', market: 'sh', industry: '银行', basePrice: 8.76 },
  { code: '600016', name: '民生银行', market: 'sh', industry: '银行', basePrice: 3.82 },
  { code: '600036', name: '招商银行', market: 'sh', industry: '银行', basePrice: 36.50 },
  { code: '601166', name: '兴业银行', market: 'sh', industry: '银行', basePrice: 17.20 },
  { code: '601398', name: '工商银行', market: 'sh', industry: '银行', basePrice: 5.68 },
  { code: '601939', name: '建设银行', market: 'sh', industry: '银行', basePrice: 7.12 },
  { code: '601288', name: '农业银行', market: 'sh', industry: '银行', basePrice: 4.35 },
  { code: '601328', name: '交通银行', market: 'sh', industry: '银行', basePrice: 6.20 },
  { code: '601988', name: '中国银行', market: 'sh', industry: '银行', basePrice: 4.50 },

  // 保险
  { code: '601318', name: '中国平安', market: 'sh', industry: '保险', basePrice: 45.80 },
  { code: '601628', name: '中国人寿', market: 'sh', industry: '保险', basePrice: 30.50 },
  { code: '601601', name: '中国太保', market: 'sh', industry: '保险', basePrice: 27.30 },

  // 证券
  { code: '600030', name: '中信证券', market: 'sh', industry: '证券', basePrice: 22.80 },
  { code: '601211', name: '国泰君安', market: 'sh', industry: '证券', basePrice: 15.60 },
  { code: '600837', name: '海通证券', market: 'sh', industry: '证券', basePrice: 10.20 },
  { code: '000776', name: '广发证券', market: 'sz', industry: '证券', basePrice: 14.90 },
  { code: '300059', name: '东方财富', market: 'sz', industry: '证券', basePrice: 15.30 },

  // 白酒/食品饮料
  { code: '600519', name: '贵州茅台', market: 'sh', industry: '白酒', basePrice: 1680.00 },
  { code: '000858', name: '五粮液', market: 'sz', industry: '白酒', basePrice: 145.00 },
  { code: '000568', name: '泸州老窖', market: 'sz', industry: '白酒', basePrice: 200.00 },
  { code: '002304', name: '洋河股份', market: 'sz', industry: '白酒', basePrice: 92.00 },
  { code: '000596', name: '古井贡酒', market: 'sz', industry: '白酒', basePrice: 240.00 },
  { code: '600887', name: '伊利股份', market: 'sh', industry: '食品饮料', basePrice: 28.50 },
  { code: '002714', name: '牧原股份', market: 'sz', industry: '养殖', basePrice: 42.00 },
  { code: '600809', name: '山西汾酒', market: 'sh', industry: '白酒', basePrice: 220.00 },
  { code: '000895', name: '双汇发展', market: 'sz', industry: '食品饮料', basePrice: 26.00 },

  // 医药
  { code: '600276', name: '恒瑞医药', market: 'sh', industry: '医药', basePrice: 48.00 },
  { code: '300760', name: '迈瑞医疗', market: 'sz', industry: '医疗器械', basePrice: 280.00 },
  { code: '000538', name: '云南白药', market: 'sz', industry: '医药', basePrice: 55.00 },
  { code: '603259', name: '药明康德', market: 'sh', industry: '医药', basePrice: 45.00 },
  { code: '300015', name: '爱尔眼科', market: 'sz', industry: '医疗服务', basePrice: 15.00 },
  { code: '000661', name: '长春高新', market: 'sz', industry: '生物制品', basePrice: 125.00 },
  { code: '300122', name: '智飞生物', market: 'sz', industry: '生物制品', basePrice: 35.00 },
  { code: '002007', name: '华兰生物', market: 'sz', industry: '生物制品', basePrice: 20.00 },
  { code: '300347', name: '泰格医药', market: 'sz', industry: '医药', basePrice: 52.00 },
  { code: '600085', name: '同仁堂', market: 'sh', industry: '中药', basePrice: 38.00 },

  // 新能源
  { code: '300750', name: '宁德时代', market: 'sz', industry: '新能源', basePrice: 210.00 },
  { code: '002594', name: '比亚迪', market: 'sz', industry: '新能源车', basePrice: 260.00 },
  { code: '601012', name: '隆基绿能', market: 'sh', industry: '光伏', basePrice: 17.50 },
  { code: '300274', name: '阳光电源', market: 'sz', industry: '光伏', basePrice: 88.00 },
  { code: '600438', name: '通威股份', market: 'sh', industry: '光伏', basePrice: 20.00 },
  { code: '002129', name: 'TCL中环', market: 'sz', industry: '光伏', basePrice: 11.50 },
  { code: '002459', name: '晶澳科技', market: 'sz', industry: '光伏', basePrice: 14.00 },
  { code: '300014', name: '亿纬锂能', market: 'sz', industry: '锂电池', basePrice: 42.00 },
  { code: '002466', name: '天齐锂业', market: 'sz', industry: '锂电池', basePrice: 32.00 },
  { code: '002460', name: '赣锋锂业', market: 'sz', industry: '锂电池', basePrice: 30.00 },

  // 科技/半导体
  { code: '688981', name: '中芯国际', market: 'sh', industry: '半导体', basePrice: 45.00 },
  { code: '002371', name: '北方华创', market: 'sz', industry: '半导体', basePrice: 320.00 },
  { code: '603986', name: '兆易创新', market: 'sh', industry: '半导体', basePrice: 95.00 },
  { code: '688012', name: '中微公司', market: 'sh', industry: '半导体', basePrice: 140.00 },
  { code: '002049', name: '紫光国微', market: 'sz', industry: '半导体', basePrice: 68.00 },
  { code: '603501', name: '韦尔股份', market: 'sh', industry: '半导体', basePrice: 100.00 },
  { code: '002415', name: '海康威视', market: 'sz', industry: '安防', basePrice: 33.00 },
  { code: '000725', name: '京东方A', market: 'sz', industry: '面板', basePrice: 4.20 },
  { code: '002475', name: '立讯精密', market: 'sz', industry: '消费电子', basePrice: 35.00 },
  { code: '300433', name: '蓝思科技', market: 'sz', industry: '消费电子', basePrice: 18.00 },

  // 互联网/软件
  { code: '300033', name: '同花顺', market: 'sz', industry: '互联网金融', basePrice: 140.00 },
  { code: '002230', name: '科大讯飞', market: 'sz', industry: '人工智能', basePrice: 48.00 },
  { code: '000938', name: '紫光股份', market: 'sz', industry: 'IT设备', basePrice: 22.00 },
  { code: '600570', name: '恒生电子', market: 'sh', industry: '金融科技', basePrice: 28.00 },
  { code: '300124', name: '汇川技术', market: 'sz', industry: '工业自动化', basePrice: 64.00 },

  // 家电
  { code: '000333', name: '美的集团', market: 'sz', industry: '家电', basePrice: 66.00 },
  { code: '000651', name: '格力电器', market: 'sz', industry: '家电', basePrice: 42.00 },
  { code: '600690', name: '海尔智家', market: 'sh', industry: '家电', basePrice: 28.00 },
  { code: '002050', name: '三花智控', market: 'sz', industry: '家电零部件', basePrice: 22.00 },

  // 房地产/基建
  { code: '000002', name: '万科A', market: 'sz', industry: '房地产', basePrice: 8.50 },
  { code: '600048', name: '保利发展', market: 'sh', industry: '房地产', basePrice: 9.80 },
  { code: '001979', name: '招商蛇口', market: 'sz', industry: '房地产', basePrice: 10.20 },
  { code: '601668', name: '中国建筑', market: 'sh', industry: '建筑', basePrice: 5.80 },
  { code: '601390', name: '中国中铁', market: 'sh', industry: '建筑', basePrice: 6.50 },
  { code: '601800', name: '中国交建', market: 'sh', industry: '建筑', basePrice: 8.20 },

  // 汽车
  { code: '600104', name: '上汽集团', market: 'sh', industry: '汽车', basePrice: 14.50 },
  { code: '000625', name: '长安汽车', market: 'sz', industry: '汽车', basePrice: 13.80 },
  { code: '601238', name: '广汽集团', market: 'sh', industry: '汽车', basePrice: 8.90 },
  { code: '600741', name: '华域汽车', market: 'sh', industry: '汽车零部件', basePrice: 16.50 },

  // 煤炭/能源
  { code: '601088', name: '中国神华', market: 'sh', industry: '煤炭', basePrice: 38.00 },
  { code: '600028', name: '中国石化', market: 'sh', industry: '石油化工', basePrice: 6.30 },
  { code: '601857', name: '中国石油', market: 'sh', industry: '石油', basePrice: 8.80 },
  { code: '600900', name: '长江电力', market: 'sh', industry: '电力', basePrice: 28.00 },
  { code: '003816', name: '中国广核', market: 'sz', industry: '核电', basePrice: 3.80 },

  // 军工
  { code: '600893', name: '航发动力', market: 'sh', industry: '军工', basePrice: 38.00 },
  { code: '002025', name: '航天电器', market: 'sz', industry: '军工', basePrice: 48.00 },
  { code: '000768', name: '中航西飞', market: 'sz', industry: '军工', basePrice: 24.00 },
  { code: '600760', name: '中航沈飞', market: 'sh', industry: '军工', basePrice: 42.00 },

  // 运输
  { code: '601111', name: '中国国航', market: 'sh', industry: '航空', basePrice: 7.50 },
  { code: '600029', name: '南方航空', market: 'sh', industry: '航空', basePrice: 5.90 },
  { code: '601006', name: '大秦铁路', market: 'sh', industry: '铁路运输', basePrice: 7.30 },
  { code: '600009', name: '上海机场', market: 'sh', industry: '机场', basePrice: 35.00 },
  { code: '601919', name: '中远海控', market: 'sh', industry: '航运', basePrice: 14.00 },

  // 通信
  { code: '600050', name: '中国联通', market: 'sh', industry: '通信', basePrice: 5.10 },
  { code: '600941', name: '中国移动', market: 'sh', industry: '通信', basePrice: 105.00 },
  { code: '300308', name: '中际旭创', market: 'sz', industry: '光通信', basePrice: 150.00 },
  { code: '002281', name: '光迅科技', market: 'sz', industry: '光通信', basePrice: 32.00 },

  // 有色/化工
  { code: '600019', name: '宝钢股份', market: 'sh', industry: '钢铁', basePrice: 6.80 },
  { code: '601168', name: '西部矿业', market: 'sh', industry: '有色金属', basePrice: 18.00 },
  { code: '002466', name: '天齐锂业', market: 'sz', industry: '有色金属', basePrice: 32.00 },
  { code: '600309', name: '万华化学', market: 'sh', industry: '化工', basePrice: 78.00 },
  { code: '601899', name: '紫金矿业', market: 'sh', industry: '有色金属', basePrice: 16.50 },

  // 综合
  { code: '688111', name: '金山办公', market: 'sh', industry: '软件服务', basePrice: 280.00 },
  { code: '300896', name: '爱美客', market: 'sz', industry: '医美', basePrice: 180.00 },
  { code: '600031', name: '三一重工', market: 'sh', industry: '工程机械', basePrice: 16.00 },
  { code: '000100', name: 'TCL科技', market: 'sz', industry: '面板', basePrice: 4.60 },
]
