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

export const DEFAULT_WEIGHTS = [];

// 扩充至 40+ 精选高频实用词汇词库，支持每天日期自动算法轮换更新！
export const EXTENDED_WORD_BANK = [
  { word: 'Deadline', phonetic: 'ˈdedlaɪn', translation: '截止日期；最终期限', category: '职场办公', example: 'We must complete the project before the deadline.' },
  { word: 'Feedback', phonetic: 'ˈfiːdbæk', translation: '反馈意见；评价', category: '职场办公', example: 'Thank you for your valuable feedback.' },
  { word: 'Optimize', phonetic: 'ˈɑːptɪmaɪz', translation: '优化；使完善', category: '技能提升', example: 'We need to optimize the workflow to save time.' },
  { word: 'Schedule', phonetic: 'ˈskedʒuːl', translation: '日程安排；时间表', category: '日常生活', example: 'Please check your schedule for tomorrow morning.' },
  { word: 'Proposal', phonetic: 'prəˈpoʊzl', translation: '提案；建议书', category: '商务沟通', example: 'The manager approved our new business proposal.' },
  { word: 'Budget', phonetic: 'ˈbʌdʒɪt', translation: '预算；开支计划', category: '理财管理', example: 'We are trying to keep within our monthly budget.' },
  { word: 'Collaborate', phonetic: 'kəˈlæbəreɪt', translation: '合作；协作', category: '团队协作', example: 'Different teams collaborate closely to deliver results.' },
  { word: 'Prioritize', phonetic: 'praɪˈɔːrətaɪz', translation: '优先考虑；按优先级处理', category: '效率自律', example: 'Prioritize your daily tasks to stay productive.' },
  { word: 'Resume', phonetic: 'ˈrezəmeɪ', translation: '个人简历', category: '求职复工', example: 'Updated your resume before applying for the position.' },
  { word: 'Efficiency', phonetic: 'ɪˈfɪʃnsi', translation: '效率；功效', category: '自我提升', example: 'High efficiency is key to modern work life.' },
  
  // 8月5日及后续自动轮换补充词汇
  { word: 'Innovation', phonetic: 'ˌɪnəˈveɪʃn', translation: '创新；革新', category: '思维升级', example: 'Innovation is the driving force of progress.' },
  { word: 'Strategy', phonetic: 'ˈstrætədʒi', translation: '策略；战略', category: '职场办公', example: 'We formulated a clear growth strategy.' },
  { word: 'Insight', phonetic: 'ˈɪnsaɪt', translation: '洞察力；深刻见解', category: '认知提升', example: 'His analysis provided great market insight.' },
  { word: 'Productivity', phonetic: 'ˌprɑːdʌkˈtɪvəti', translation: '生产力；工作效率', category: '效率自律', example: 'Good habits boost overall productivity.' },
  { word: 'Negotiate', phonetic: 'nɪˈɡoʊʃieɪt', translation: '谈判；协商', category: '商务沟通', example: 'She successfully negotiated a better deal.' },
  { word: 'Perspective', phonetic: 'pərˈspektɪv', translation: '视角；观点', category: '思维升级', example: 'Try to see the problem from a different perspective.' },
  { word: 'Fulfill', phonetic: 'fʊlˈfɪl', translation: '实现；履行', category: '自我提升', example: 'Hard work helps you fulfill your dreams.' },
  { word: 'Asset', phonetic: 'ˈæset', translation: '资产；有价值的人/物', category: '理财管理', example: 'Knowledge is your most valuable asset.' },
  { word: 'Resilient', phonetic: 'rɪˈzɪliənt', translation: '坚韧的；有复原力的', category: '心态情绪', example: 'Stay resilient when facing unexpected challenges.' },
  { word: 'Milestone', phonetic: 'ˈmaɪlstoʊn', translation: '里程碑；重要阶段', category: '目标规划', example: 'Launching this app is a major milestone.' },

  { word: 'Workflow', phonetic: 'ˈwɜːrkfloʊ', translation: '工作流程', category: '职场办公', example: 'Streamline your daily workflow to save energy.' },
  { word: 'Consensus', phonetic: 'kənˈsensəs', translation: '共识；一致意见', category: '团队协作', example: 'The team reached a consensus after discussion.' },
  { word: 'Evaluate', phonetic: 'ɪˈvæljueɪt', translation: '评估；评价', category: '技能提升', example: 'Evaluate the results at the end of each week.' },
  { word: 'Mindset', phonetic: 'ˈmaɪndset', translation: '思维模式；心态', category: '认知提升', example: 'Adopt a growth mindset to keep learning.' },
  { word: 'Delegate', phonetic: 'ˈdelɪɡət', translation: '委派；分派任务', category: '职场管理', example: 'Learn to delegate tasks to manage time better.' },
  { word: 'Sustainable', phonetic: 'səˈsteɪnəbl', translation: '可持续的；稳定的', category: '生活方式', example: 'Build a sustainable daily routine.' },
  { word: 'Benchmark', phonetic: 'ˈbentʃmɑːrk', translation: '基准；参照标准', category: '目标规划', example: 'Set high quality standards as a benchmark.' },
  { word: 'Adaptability', phonetic: 'əˌdæptəˈbɪləti', translation: '适应能力', category: '自我提升', example: 'Adaptability is crucial in a changing environment.' },
  { word: 'Discipline', phonetic: 'ˈdɪsəplɪn', translation: '自律；纪律', category: '效率自律', example: 'Self-discipline brings real freedom.' },
  { word: 'Execute', phonetic: 'ˈeksɪkjuːt', translation: '执行；实施', category: '目标规划', example: 'A good plan is useless unless you execute it.' }
];

export const WORD_BANK = EXTENDED_WORD_BANK;
