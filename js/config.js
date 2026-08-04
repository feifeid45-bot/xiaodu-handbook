// js/config.js - 全局配置项与静态常数定义

export const NAV_ITEMS = [
  { id: 'weather', name: '天气预报', icon: '🌤️', desc: '墨迹风格区段色块24h坐标与7天预报' },
  { id: 'todo', name: '待办事项', icon: '📆', desc: '日历视角待办与琐事提醒' },
  { id: 'habit', name: '每日计划', icon: '🌟', desc: '自律习惯打卡与连胜统计' },
  { id: 'expense', name: '极简记账', icon: '💰', desc: '失业/理财专属单向支出管控' },
  { id: 'english', name: '英语学习', icon: '📚', desc: '每日 10 实用词汇与美音朗读' },
  { id: 'gold', name: '实时金价', icon: '🪙', desc: '真实国际金价 API 实时行情' },
  { id: 'weight', name: '体重记录', icon: '⚖️', desc: '长期体重走势与可视化曲线' }
];

export const CITY_LIST = [
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '杭州', lat: 30.2741, lon: 120.1551 },
  { name: '成都', lat: 30.5728, lon: 104.0668 },
  { name: '武汉', lat: 30.5928, lon: 114.3055 },
  { name: '西安', lat: 34.3416, lon: 108.9398 }
];

export const EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: '🍱' },
  { name: '交通', icon: '🚗' },
  { name: '购物', icon: '🛍️' },
  { name: '房租水电', icon: '🏠' },
  { name: '娱乐', icon: '🎮' },
  { name: '日用品', icon: '🧻' },
  { name: '医疗', icon: '💊' },
  { name: '其他', icon: '📦' }
];

export const DEFAULT_HABITS = [
  { id: 1, name: '抖音账号运营', icon: '📱', duration: 45, streak: 3, lastCheckDate: '' },
  { id: 2, name: '日常专业学习', icon: '📖', duration: 60, streak: 5, lastCheckDate: '' },
  { id: 3, name: '体能锻炼拉伸', icon: '🏃', duration: 30, streak: 2, lastCheckDate: '' },
  { id: 4, name: '英语实用词汇打卡', icon: '🔤', duration: 15, streak: 7, lastCheckDate: '' }
];

// 依照用户要求：清空默认示例数据，纯粹根据用户输入的最新数据来更新！
export const DEFAULT_WEIGHTS = [];

export const WORD_BANK = [
  { word: 'Deadline', phonetic: 'ˈdedlaɪn', translation: '截止日期；最终期限', category: '职场办公', example: 'We must complete the project before the deadline.' },
  { word: 'Feedback', phonetic: 'ˈfiːdbæk', translation: '反馈意见；评价', category: '职场办公', example: 'Thank you for your valuable feedback.' },
  { word: 'Optimize', phonetic: 'ˈɑːptɪmaɪz', translation: '优化；使完善', category: '技能提升', example: 'We need to optimize the workflow to save time.' },
  { word: 'Schedule', phonetic: 'ˈskedʒuːl', translation: '日程安排；时间表', category: '日常生活', example: 'Please check your schedule for tomorrow morning.' },
  { word: 'Proposal', phonetic: 'prəˈpoʊzl', translation: '提案；建议书', category: '商务沟通', example: 'The manager approved our new business proposal.' },
  { word: 'Budget', phonetic: 'ˈbʌdʒɪt', translation: '预算；开支计划', category: '理财管理', example: 'We are trying to keep within our monthly budget.' },
  { word: 'Collaborate', phonetic: 'kəˈlæbəreɪt', translation: '合作；协作', category: '团队协作', example: 'Different teams collaborate closely to deliver results.' },
  { word: 'Prioritize', phonetic: 'praɪˈɔːrətaɪz', translation: '优先考虑；按优先级处理', category: '效率自律', example: 'Prioritize your daily tasks to stay productive.' },
  { word: 'Resume', phonetic: 'ˈrezəmeɪ', translation: '个人简历', category: '求职复工', example: 'Updated your resume before applying for the position.' },
  { word: 'Efficiency', phonetic: 'ɪˈfɪʃnsi', translation: '效率；功效', category: '自我提升', example: 'High efficiency is key to modern work life.' }
];
