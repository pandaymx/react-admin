import { request } from '@/api/request';
import type {
  ActivityCategoryItem,
  ActivityDetailRespVO,
  ActivityItem,
  ActivityPageReqVO,
  ActivitySaveReqVO,
  ActivitySubcategoryItem,
  ActivitySummaryKPI,
  ApiResponse,
} from '@/types';

// ==================== 真实活动主题大类与子类 Mock 数据字典 ====================

export const mockActivityCategories: ActivityCategoryItem[] = [
  { id: 'driving', code: 'driving', name: '自驾与旅行', icon: 'CarOutlined', sort: 10, status: 1 },
  { id: 'family', code: 'family', name: '亲子与家庭', icon: 'SmileOutlined', sort: 20, status: 1 },
  {
    id: 'outdoor',
    code: 'outdoor',
    name: '户外运动',
    icon: 'CompassOutlined',
    sort: 30,
    status: 1,
  },
  { id: 'life', code: 'life', name: '生活体验', icon: 'CoffeeOutlined', sort: 40, status: 1 },
  { id: 'photo', code: 'photo', name: '摄影创作', icon: 'CameraOutlined', sort: 50, status: 1 },
  { id: 'ball', code: 'ball', name: '球类运动', icon: 'TrophyOutlined', sort: 60, status: 1 },
  { id: 'culture', code: 'culture', name: '文化休闲', icon: 'BookOutlined', sort: 70, status: 1 },
];

export const mockActivitySubcategories: ActivitySubcategoryItem[] = [
  // 自驾与旅行
  {
    id: 'nearby_trip',
    categoryId: 'driving',
    code: 'nearby_trip',
    name: '周边游',
    pageCode: 'category_2',
    sort: 10,
    status: 1,
  },
  {
    id: 'long_distance_travel',
    categoryId: 'driving',
    code: 'long_distance_travel',
    name: '长途旅行',
    pageCode: 'category_2',
    sort: 20,
    status: 1,
  },
  {
    id: 'rv_travel',
    categoryId: 'driving',
    code: 'rv_travel',
    name: '房车旅行',
    pageCode: 'category_2',
    sort: 30,
    status: 1,
  },
  {
    id: 'carpool',
    categoryId: 'driving',
    code: 'carpool',
    name: '拼车',
    pageCode: 'category_2',
    sort: 40,
    status: 1,
  },
  // 亲子与家庭
  {
    id: 'theme_park_group',
    categoryId: 'family',
    code: 'theme_park_group',
    name: '主题乐园组团',
    pageCode: 'category_1',
    sort: 10,
    status: 1,
  },
  {
    id: 'children_handicraft',
    categoryId: 'family',
    code: 'children_handicraft',
    name: '儿童手工',
    pageCode: 'category_1',
    sort: 20,
    status: 1,
  },
  {
    id: 'popular_science',
    categoryId: 'family',
    code: 'popular_science',
    name: '科普探索',
    pageCode: 'category_1',
    sort: 30,
    status: 1,
  },
  // 户外运动
  {
    id: 'hiking',
    categoryId: 'outdoor',
    code: 'hiking',
    name: '户外徒步',
    pageCode: 'category_2',
    sort: 10,
    status: 1,
  },
  {
    id: 'mountaineering',
    categoryId: 'outdoor',
    code: 'mountaineering',
    name: '登山',
    pageCode: 'category_2',
    sort: 20,
    status: 1,
  },
  {
    id: 'cycling',
    categoryId: 'outdoor',
    code: 'cycling',
    name: '骑行',
    pageCode: 'category_2',
    sort: 40,
    status: 1,
  },
  {
    id: 'camping',
    categoryId: 'outdoor',
    code: 'camping',
    name: '露营',
    pageCode: 'category_1',
    sort: 50,
    status: 1,
  },
  {
    id: 'rafting',
    categoryId: 'outdoor',
    code: 'rafting',
    name: '漂流',
    pageCode: 'category_1',
    sort: 60,
    status: 1,
  },
  {
    id: 'climbing',
    categoryId: 'outdoor',
    code: 'climbing',
    name: '攀岩抱石',
    pageCode: 'category_1',
    sort: 70,
    status: 1,
  },
  {
    id: 'skiing',
    categoryId: 'outdoor',
    code: 'skiing',
    name: '滑雪',
    pageCode: 'category_1',
    sort: 90,
    status: 1,
  },
  {
    id: 'marathon',
    categoryId: 'outdoor',
    code: 'marathon',
    name: '马拉松/跑步',
    pageCode: 'category_1',
    sort: 100,
    status: 1,
  },
  // 生活体验
  {
    id: 'cooking',
    categoryId: 'life',
    code: 'cooking',
    name: '烹饪与烘焙',
    pageCode: 'category_1',
    sort: 10,
    status: 1,
  },
  {
    id: 'food_exploration',
    categoryId: 'life',
    code: 'food_exploration',
    name: '美食探店',
    pageCode: 'category_1',
    sort: 20,
    status: 1,
  },
  {
    id: 'coffee_tea',
    categoryId: 'life',
    code: 'coffee_tea',
    name: '精品咖啡/茶艺',
    pageCode: 'category_1',
    sort: 30,
    status: 1,
  },
  {
    id: 'handicraft',
    categoryId: 'life',
    code: 'handicraft',
    name: '手作皮具/木工',
    pageCode: 'category_1',
    sort: 40,
    status: 1,
  },
  // 摄影创作
  {
    id: 'portrait_photo',
    categoryId: 'photo',
    code: 'portrait_photo',
    name: '人像写真',
    pageCode: 'category_3',
    sort: 10,
    status: 1,
  },
  {
    id: 'landscape_photo',
    categoryId: 'photo',
    code: 'landscape_photo',
    name: '风光摄影',
    pageCode: 'category_3',
    sort: 20,
    status: 1,
  },
  {
    id: 'drone_aerial',
    categoryId: 'photo',
    code: 'drone_aerial',
    name: '无人机航拍',
    pageCode: 'category_3',
    sort: 30,
    status: 1,
  },
  {
    id: 'street_snap',
    categoryId: 'photo',
    code: 'street_snap',
    name: '街头扫街',
    pageCode: 'category_3',
    sort: 40,
    status: 1,
  },
  // 球类运动
  {
    id: 'badminton',
    categoryId: 'ball',
    code: 'badminton',
    name: '羽毛球',
    pageCode: 'category_1',
    sort: 10,
    status: 1,
  },
  {
    id: 'tennis',
    categoryId: 'ball',
    code: 'tennis',
    name: '网球',
    pageCode: 'category_1',
    sort: 20,
    status: 1,
  },
  {
    id: 'table_tennis',
    categoryId: 'ball',
    code: 'table_tennis',
    name: '乒乓球',
    pageCode: 'category_1',
    sort: 30,
    status: 1,
  },
  {
    id: 'basketball',
    categoryId: 'ball',
    code: 'basketball',
    name: '篮球',
    pageCode: 'category_1',
    sort: 40,
    status: 1,
  },
  {
    id: 'football',
    categoryId: 'ball',
    code: 'football',
    name: '足球',
    pageCode: 'category_1',
    sort: 50,
    status: 1,
  },
  // 文化休闲
  {
    id: 'murder_mystery',
    categoryId: 'culture',
    code: 'murder_mystery',
    name: '剧本杀',
    pageCode: 'category_1',
    sort: 10,
    status: 1,
  },
  {
    id: 'board_games',
    categoryId: 'culture',
    code: 'board_games',
    name: '桌游聚会',
    pageCode: 'category_1',
    sort: 20,
    status: 1,
  },
  {
    id: 'exhibition',
    categoryId: 'culture',
    code: 'exhibition',
    name: '美术看展',
    pageCode: 'category_1',
    sort: 30,
    status: 1,
  },
  {
    id: 'movie_club',
    categoryId: 'culture',
    code: 'movie_club',
    name: '观影交流会',
    pageCode: 'category_1',
    sort: 40,
    status: 1,
  },
  {
    id: 'citywalk',
    categoryId: 'culture',
    code: 'citywalk',
    name: '城市漫步(Citywalk)',
    pageCode: 'category_1',
    sort: 50,
    status: 1,
  },
  {
    id: 'book_club',
    categoryId: 'culture',
    code: 'book_club',
    name: '读书沙龙',
    pageCode: 'category_1',
    sort: 60,
    status: 1,
  },
];

export let dynamicCategories = [...mockActivityCategories];
export let dynamicSubcategories = [...mockActivitySubcategories];

// ==================== 高拟真活动主档与子表 Mock 数据集 ====================

export const mockActivities: ActivityDetailRespVO[] = [
  {
    id: 'ACT_20260901001',
    title: '【秋季登高】鳌太穿越线轻装体验 3日精华徒步',
    categoryId: 'outdoor',
    categoryName: '户外运动',
    subcategoryId: 'hiking',
    subcategoryName: '户外徒步',
    publisherUserId: '100088',
    publisherNickname: '秦岭老向导·大山',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dashan',
    status: 1, // 已发布
    coverUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    city: '宝鸡',
    startTime: '2026-09-20 07:00:00',
    endTime: '2026-09-22 18:00:00',
    enrollDeadline: '2026-09-18 20:00:00',
    feeMode: 'AA',
    feeAmount: 680,
    currentEnrollCount: 16,
    maxParticipants: 18,
    minParticipants: 8,
    ageMin: 18,
    ageMax: 50,
    introduction:
      '秦岭山脉秋景正浓，金黄落叶松与高山草甸交织。本次活动配备专业中登领队与卫星应急救援电话，适合有初级徒步经验的驴友。',
    enrollNotice: '需具备至少一次 15km 负重徒步经验，心血管疾病者禁止参加。',
    caution: '高山温差大，早晚气温可能接近 0℃，必须携带冲锋衣、抓绒衣及头灯。',
    tips: '建议自备 3L 以上水袋及 2 顿路餐干粮。',
    refundRuleType: '出发前48小时全额退款，24小时内扣除30%车费损耗',
    createdAt: '2026-09-01 10:00:00',
    updatedAt: '2026-09-05 16:30:00',
    meetingPoints: [
      {
        id: 'mp_01',
        name: '西安地铁2号线航天城站 B口',
        address: '西安市长安区航天大道口',
        timeText: '06:40',
      },
      {
        id: 'mp_02',
        name: '太白县塘口登山口驿站',
        address: '宝鸡市太白县塘口村',
        timeText: '09:30',
      },
    ],
    images: [
      {
        id: 'img_01',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
      {
        id: 'img_02',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        isCover: 0,
        sort: 2,
      },
      {
        id: 'img_03',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        isCover: 0,
        sort: 3,
      },
    ],
    managers: [
      {
        id: 'mng_01',
        userId: '100088',
        role: '总领队 (中登中级证书)',
        nickname: '大山',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dashan',
      },
      {
        id: 'mng_02',
        userId: '100092',
        role: '后队收队兼应急救护员',
        nickname: '清风',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qingfeng',
      },
    ],
    itineraries: [
      {
        id: 'it_01',
        dayNo: 1,
        timeText: '07:00 - 11:30',
        content: '包车前往塘口，做行前拉伸与检查装备',
      },
      {
        id: 'it_02',
        dayNo: 1,
        timeText: '12:00 - 17:30',
        content: '从塘口拔高至大爷海营地，沿途打点拍照，夜宿营地木屋',
      },
      {
        id: 'it_03',
        dayNo: 2,
        timeText: '06:00 - 16:00',
        content: '拔仙台日出，穿越跑马梁高山石海',
      },
      {
        id: 'it_04',
        dayNo: 3,
        timeText: '08:30 - 15:00',
        content: '经铁甲树景区下撤，品尝当地农家乐庆功宴返程',
      },
    ],
    feeItems: [
      {
        id: 'fi_01',
        title: '往返正规旅游大巴包车费用',
        content: '包含路桥费、司机津贴',
        feeType: 'include',
      },
      {
        id: 'fi_02',
        title: '50万保额专业高山户外特种意外险',
        content: '含高海拔直升机救援保障',
        feeType: 'include',
      },
      {
        id: 'fi_03',
        title: '高山向导与公用急救药包消耗',
        content: '血氧仪、对讲机、卫星定位器',
        feeType: 'include',
      },
      {
        id: 'fi_04',
        title: '个人行程内餐饮及租借帐篷睡袋',
        content: '属于个人开支需自理',
        feeType: 'exclude',
      },
    ],
    equipmentRefs: ['登山杖(双杖)', '40L徒步背包', '高帮防滑防水登山鞋', '偏光太阳镜', '冲锋衣裤'],
    models: [],
    enrollments: [
      {
        id: 'enr_01',
        userId: '100001',
        nickname: '超级探险家',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        phone: '138****0001',
        enrollCount: 1,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-09-02 11:20:00',
      },
      {
        id: 'enr_02',
        userId: '100002',
        nickname: '雪山飞狐',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        phone: '139****0002',
        enrollCount: 2,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-09-03 09:15:00',
      },
    ],
  },
  {
    id: 'ACT_20260901002',
    title: '【周末微醺】江畔星空露营音乐会 & 精酿BBQ派对',
    categoryId: 'outdoor',
    categoryName: '户外运动',
    subcategoryId: 'camping',
    subcategoryName: '露营',
    publisherUserId: '100105',
    publisherNickname: '露营实验室·安安',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anan',
    status: 2, // 进行中
    coverUrl:
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    city: '杭州',
    startTime: '2026-09-10 15:00:00',
    endTime: '2026-09-11 11:00:00',
    enrollDeadline: '2026-09-09 22:00:00',
    feeMode: 'PAID',
    feeAmount: 299,
    currentEnrollCount: 30,
    maxParticipants: 30, // 满额
    minParticipants: 10,
    ageMin: 20,
    ageMax: 40,
    introduction:
      '富春江畔草坪营地，提供天幕、蛋卷桌椅、生啤畅饮与live吉他弹唱，带你逃离城市焦虑。',
    enrollNotice: '营地支持拎包入住，提供公共淋浴与卫生间。',
    caution: '水深危险，严禁私自下水游泳。夜间请注意保持营地安静。',
    tips: '自带保温杯和防蚊喷雾体验更佳。',
    refundRuleType: '出发前24小时退订扣除50%食材准备损耗',
    createdAt: '2026-09-02 14:00:00',
    updatedAt: '2026-09-08 20:00:00',
    meetingPoints: [
      {
        id: 'mp_21',
        name: '杭州东站出发大厅南进站口',
        address: '杭州市上城区新风路',
        timeText: '13:30',
      },
      {
        id: 'mp_22',
        name: '富春江畔野望营地接待中心',
        address: '杭州市富阳区新桐乡',
        timeText: '15:00',
      },
    ],
    images: [
      {
        id: 'img_21',
        url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
    ],
    managers: [
      {
        id: 'mng_21',
        userId: '100105',
        role: '营地主理人',
        nickname: '安安',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anan',
      },
    ],
    itineraries: [
      {
        id: 'it_21',
        dayNo: 1,
        timeText: '15:00 - 17:00',
        content: '营地签到破冰，搭建天幕与手冲咖啡品鉴',
      },
      {
        id: 'it_22',
        dayNo: 1,
        timeText: '18:00 - 21:00',
        content: '炭火BBQ烤肉，民谣吉他弹唱，互动桌游',
      },
      {
        id: 'it_23',
        dayNo: 2,
        timeText: '08:30 - 11:00',
        content: '晨光唤醒，自制三明治早餐，悠闲拍照返程',
      },
    ],
    feeItems: [
      {
        id: 'fi_21',
        title: '营地场地使用与全套天幕桌椅',
        content: '含电力补给与公共卫浴',
        feeType: 'include',
      },
      {
        id: 'fi_22',
        title: 'BBQ烤肉食材与精酿生啤不限量畅饮',
        content: '牛排、羊肉串、时蔬等',
        feeType: 'include',
      },
    ],
    equipmentRefs: ['露营折叠椅', '防蚊液', '露营灯'],
    models: [],
  },
  {
    id: 'ACT_20260901003',
    title: '【新手畅打】周四晚奥体中心羽毛球趣味对抗赛 (3片连开)',
    categoryId: 'ball',
    categoryName: '球类运动',
    subcategoryId: 'badminton',
    subcategoryName: '羽毛球',
    publisherUserId: '100033',
    publisherNickname: '球场飞毛腿',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=badminton',
    status: 1, // 已发布
    coverUrl:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    city: '北京',
    startTime: '2026-09-17 19:00:00',
    endTime: '2026-09-17 21:00:00',
    enrollDeadline: '2026-09-17 12:00:00',
    feeMode: 'AA',
    feeAmount: 45,
    currentEnrollCount: 14,
    maxParticipants: 18,
    minParticipants: 6,
    ageMin: 18,
    ageMax: 60,
    introduction:
      '每周固定球局，木地板+专业龙骨减震场地，提供亚狮龙7号比赛用球，男女双打、混双轮换。',
    enrollNotice: '请穿生胶底羽毛球鞋入场，黑底鞋严禁入场。',
    caution: '做好热身，避免腕踝扭伤。',
    tips: '馆内提供直饮水，前台可扫码租借球拍。',
    refundRuleType: '活动开始前6小时不可退',
    createdAt: '2026-09-05 09:30:00',
    updatedAt: '2026-09-08 10:00:00',
    meetingPoints: [
      {
        id: 'mp_31',
        name: '奥体中心羽毛球馆 1-3号场地',
        address: '北京市朝阳区安定路1号',
        timeText: '18:50',
      },
    ],
    images: [
      {
        id: 'img_31',
        url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
    ],
    managers: [
      {
        id: 'mng_31',
        userId: '100033',
        role: '裁判兼组织者',
        nickname: '球场飞毛腿',
      },
    ],
    itineraries: [
      { id: 'it_31', dayNo: 1, timeText: '18:50 - 19:10', content: '集合签到，拉伸热身，分发新球' },
      { id: 'it_32', dayNo: 1, timeText: '19:10 - 21:00', content: '分组双打循环赛，以球会友' },
    ],
    feeItems: [
      {
        id: 'fi_31',
        title: '室内专业场馆场地费 (3片场地2小时)',
        content: '均摊场地租金',
        feeType: 'include',
      },
      {
        id: 'fi_32',
        title: '亚狮龙7号羽毛球损耗',
        content: '提供优质比赛鹅毛球',
        feeType: 'include',
      },
    ],
    equipmentRefs: ['专业羽毛球鞋', '羽毛球拍', '运动吸汗毛巾'],
    models: [],
  },
  {
    id: 'ACT_20260901004',
    title: '【待审核草稿】可可西里无人机生态航拍创作之旅 7日团',
    categoryId: 'photo',
    categoryName: '摄影创作',
    subcategoryId: 'drone_aerial',
    subcategoryName: '无人机航拍',
    publisherUserId: '100008',
    publisherNickname: '飞手阿峰',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=afeng',
    status: 5, // 审核中
    coverUrl:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    city: '西宁',
    startTime: '2026-10-01 08:00:00',
    endTime: '2026-10-07 18:00:00',
    enrollDeadline: '2026-09-25 18:00:00',
    feeMode: 'PAID',
    feeAmount: 5800,
    currentEnrollCount: 3,
    maxParticipants: 10,
    minParticipants: 4,
    ageMin: 22,
    ageMax: 55,
    introduction:
      '穿越柴达木盆地与可可西里边缘保护区，配备四驱硬派越野与专业航拍指导，捕捉藏羚羊奔腾瞬间。',
    enrollNotice: '高原反应初筛，禁止带病上高原。无人机须提前办理报备登记。',
    caution: '高海拔严禁剧烈奔跑，严格听从向导指令不得离开车队视线。',
    tips: '准备至少 4 块以上电池及大容量移动电站。',
    refundRuleType: '出票后退改按航空公司与租车行实退执行',
    createdAt: '2026-09-08 11:00:00',
    updatedAt: '2026-09-09 15:20:00',
    meetingPoints: [
      {
        id: 'mp_41',
        name: '西宁曹家堡国际机场 T2到达厅',
        address: '西宁市互助土族自治县',
        timeText: '09:00',
      },
    ],
    images: [
      {
        id: 'img_41',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
    ],
    managers: [
      {
        id: 'mng_41',
        userId: '100008',
        role: '无人机领航教官',
        nickname: '阿峰',
      },
    ],
    itineraries: [
      { id: 'it_41', dayNo: 1, timeText: '全天', content: '西宁集结，适应海拔，航拍安全守则培训' },
      {
        id: 'it_42',
        dayNo: 2,
        timeText: '08:00 - 18:00',
        content: '青海湖西岸公路巡航，茶卡盐湖星空倒影拍摄',
      },
    ],
    feeItems: [
      {
        id: 'fi_41',
        title: '硬派越野车租金及燃油通行费',
        content: '丰田普拉多一车4人',
        feeType: 'include',
      },
    ],
    equipmentRefs: ['大疆无人机', '防风沙相机罩', '户外移动电源'],
    models: [],
  },
  {
    id: 'ACT_20260901005',
    title: '【草稿待完善】万龙滑雪场开板首滑 早鸟周末营',
    categoryId: 'outdoor',
    categoryName: '户外运动',
    subcategoryId: 'skiing',
    subcategoryName: '滑雪',
    publisherUserId: '100088',
    publisherNickname: '秦岭老向导·大山',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dashan',
    status: 0, // 草稿
    coverUrl:
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
    city: '张家口',
    startTime: '2026-11-15 08:30:00',
    endTime: '2026-11-16 17:00:00',
    enrollDeadline: '2026-11-10 18:00:00',
    feeMode: 'PAID',
    feeAmount: 1200,
    currentEnrollCount: 0,
    maxParticipants: 20,
    minParticipants: 5,
    ageMin: 16,
    ageMax: 60,
    introduction: '崇礼万龙滑雪场 2026 开板首滑特惠活动，包含全天索道雪票与雪具租赁。',
    enrollNotice: '必须佩戴滑雪头盔。',
    caution: '滑雪具有一定危险性，初学者请勿私自上高级道。',
    tips: '推荐提前自备雪镜与速干保暖内衣。',
    createdAt: '2026-09-09 16:00:00',
    updatedAt: '2026-09-09 16:30:00',
    meetingPoints: [
      {
        id: 'mp_51',
        name: '万龙滑雪场雪具大厅服务台',
        address: '张家口市崇礼区黄土嘴村',
        timeText: '08:30',
      },
    ],
    images: [
      {
        id: 'img_51',
        url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
    ],
    managers: [],
    itineraries: [],
    feeItems: [],
    equipmentRefs: [],
    models: [],
  },
  {
    id: 'ACT_20260901006',
    title: '【已结束】八达岭古长城暮色夕阳摄影沙龙 (已归档)',
    categoryId: 'photo',
    categoryName: '摄影创作',
    subcategoryId: 'landscape_photo',
    subcategoryName: '风光摄影',
    publisherUserId: '100066',
    publisherNickname: '光影魔术手',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guangying',
    status: 3, // 已结束
    coverUrl:
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    city: '北京',
    startTime: '2026-08-15 14:00:00',
    endTime: '2026-08-15 20:30:00',
    enrollDeadline: '2026-08-14 12:00:00',
    feeMode: 'AA',
    feeAmount: 80,
    currentEnrollCount: 15,
    maxParticipants: 15,
    minParticipants: 5,
    ageMin: 18,
    ageMax: 65,
    introduction: '记录残长城的沧桑暮色与夏季落日余晖，现场教学长曝光技巧与慢门滤镜使用。',
    createdAt: '2026-08-01 10:00:00',
    updatedAt: '2026-08-16 09:00:00',
    meetingPoints: [],
    images: [
      {
        id: 'img_61',
        url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
        isCover: 1,
        sort: 1,
      },
    ],
    managers: [],
    itineraries: [],
    feeItems: [],
    equipmentRefs: [],
    models: [],
  },
  {
    id: 'ACT_20260901007',
    title: '【已取消】千岛湖急流皮划艇与漂流探险营 (因暴雨恶劣天气)',
    categoryId: 'outdoor',
    categoryName: '户外运动',
    subcategoryId: 'rafting',
    subcategoryName: '漂流',
    publisherUserId: '100105',
    publisherNickname: '露营实验室·安安',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anan',
    status: 4, // 已取消
    rejectReason: '气象局发布台风与局部特大暴雨橙色预警，为确保人员绝对安全取消并全额退款。',
    coverUrl:
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80',
    city: '杭州',
    startTime: '2026-09-05 09:00:00',
    endTime: '2026-09-06 17:00:00',
    enrollDeadline: '2026-09-03 18:00:00',
    feeMode: 'PAID',
    feeAmount: 1800,
    currentEnrollCount: 12,
    maxParticipants: 12,
    minParticipants: 6,
    ageMin: 18,
    ageMax: 55,
    introduction: 'ASA 体系入门级龙骨帆船驾驶，因突发恶劣台风气象取消。',
    createdAt: '2026-08-20 12:00:00',
    updatedAt: '2026-09-04 14:00:00',
    meetingPoints: [],
    images: [],
    managers: [],
    itineraries: [],
    feeItems: [],
    equipmentRefs: [],
    models: [],
  },
];

let dynamicActivities: ActivityDetailRespVO[] = [...mockActivities];

// ==================== 活动管理 API ====================

export async function getActivityPage(
  params?: ActivityPageReqVO,
): Promise<ApiResponse<{ list: ActivityItem[]; total: number }>> {
  // 清洗 query 参数：后端 status 为 java.lang.Integer，禁止传递 "all"，全部查询时必须剔除 status 字段
  const queryParams: Record<string, any> = {
    pageNo: params?.pageNo || 1,
    pageSize: Math.min(Math.max(params?.pageSize || 20, 1), 100),
  };
  if (params?.status !== undefined && (params.status as any) !== 'all') {
    queryParams.status = Number(params.status);
  }
  if (params?.city && params.city !== 'all') {
    queryParams.city = params.city;
  }
  if (params?.title?.trim()) {
    queryParams.title = params.title.trim();
  }
  if (params?.subcategoryId && params.subcategoryId !== 'all') {
    queryParams.subcategoryId = params.subcategoryId;
  }
  if (params?.categoryId && params.categoryId !== 'all') {
    queryParams.categoryId = params.categoryId;
  }
  if (params?.publisherUserId?.trim()) {
    queryParams.publisherUserId = params.publisherUserId.trim();
  }

  try {
    const res = await request<{ list: ActivityItem[]; total: number }>({
      url: '/activity2/activity/page',
      method: 'GET',
      params: queryParams,
    });
    if (res && res.code === 0 && res.data) return res;
  } catch (error) {
    console.warn('获取活动分页失败，使用内置 Mock 兜底数据', error);
  }

  let filtered = [...dynamicActivities];
  if (params?.status !== undefined && params.status !== 'all') {
    filtered = filtered.filter((act) => act.status === Number(params.status));
  }
  if (params?.city) {
    filtered = filtered.filter((act) => act.city.includes(params.city as string));
  }
  if (params?.title) {
    const kw = params.title.trim().toLowerCase();
    filtered = filtered.filter((act) => act.title.toLowerCase().includes(kw));
  }
  if (params?.categoryId) {
    filtered = filtered.filter((act) => act.categoryId === params.categoryId);
  }
  if (params?.subcategoryId) {
    filtered = filtered.filter((act) => act.subcategoryId === params.subcategoryId);
  }

  return {
    code: 0,
    msg: 'success',
    data: {
      list: filtered,
      total: filtered.length,
    },
  };
}

// ==================== 活动主题大类与细分子类 API ====================

/**
 * 获取活动大类(主题)列表（含禁用）
 * GET /admin-api/activity2/config/category/list
 */
export async function getActivityCategoryList(): Promise<ApiResponse<ActivityCategoryItem[]>> {
  try {
    const res = await request<ActivityCategoryItem[]>({
      url: '/activity2/config/category/list',
      method: 'GET',
    });
    if (res && res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (error) {
    console.warn('获取活动大类列表失败，降级使用真实 Mock 大类字典', error);
  }

  return {
    code: 0,
    msg: 'success',
    data: dynamicCategories,
  };
}

/**
 * 获取活动子类列表
 * GET /admin-api/activity2/config/subcategory/list
 */
export async function getActivitySubcategoryList(
  categoryId?: string,
): Promise<ApiResponse<ActivitySubcategoryItem[]>> {
  try {
    const res = await request<ActivitySubcategoryItem[]>({
      url: '/activity2/config/subcategory/list',
      method: 'GET',
      params: categoryId ? { categoryId } : undefined,
    });
    if (res && res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
  } catch (error) {
    console.warn('获取活动子类列表失败，降级使用真实 Mock 子类字典', error);
  }

  const result = categoryId
    ? dynamicSubcategories.filter((sub) => sub.categoryId === categoryId)
    : dynamicSubcategories;

  return {
    code: 0,
    msg: 'success',
    data: result,
  };
}

/**
 * 创建活动大类
 * POST /admin-api/activity2/config/category/create
 */
export async function createActivityCategory(
  data: Partial<ActivityCategoryItem>,
): Promise<ApiResponse<string>> {
  try {
    const res = await request<string>({
      url: '/activity2/config/category/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建活动大类失败，进行本地 Mock 处理', error);
  }

  const id = `cat_${Date.now()}`;
  const newCat: ActivityCategoryItem = {
    id,
    code: data.code || `cat_${data.sort || 99}`,
    name: data.name || '新建大类',
    icon: data.icon || null,
    sort: data.sort || dynamicCategories.length * 10 + 10,
    status: data.status !== undefined ? data.status : 1,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  dynamicCategories.push(newCat);
  return { code: 0, msg: '创建成功', data: id };
}

/**
 * 更新活动大类
 * PUT /admin-api/activity2/config/category/update
 */
export async function updateActivityCategory(
  data: Partial<ActivityCategoryItem>,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/config/category/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新活动大类失败，进行本地 Mock 处理', error);
  }

  const index = dynamicCategories.findIndex((c) => c.id === data.id);
  if (index >= 0) {
    dynamicCategories[index] = { ...dynamicCategories[index], ...data };
  }
  return { code: 0, msg: '更新成功', data: true };
}

/**
 * 删除活动大类
 * DELETE /admin-api/activity2/config/category/delete
 */
export async function deleteActivityCategory(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/config/category/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除活动大类失败，进行本地 Mock 处理', error);
  }

  dynamicCategories = dynamicCategories.filter((c) => c.id !== id);
  dynamicSubcategories = dynamicSubcategories.filter((s) => s.categoryId !== id);
  return { code: 0, msg: '删除成功', data: true };
}

/**
 * 创建活动子类
 * POST /admin-api/activity2/config/subcategory/create
 */
export async function createActivitySubcategory(
  data: Partial<ActivitySubcategoryItem>,
): Promise<ApiResponse<string>> {
  try {
    const res = await request<string>({
      url: '/activity2/config/subcategory/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建活动子类失败，进行本地 Mock 处理', error);
  }

  const id = `sub_${Date.now()}`;
  const newSub: ActivitySubcategoryItem = {
    id,
    categoryId: data.categoryId || '',
    code: data.code || `sub_${data.sort || 99}`,
    pageCode: data.pageCode || 'category_1',
    name: data.name || '新建子类',
    icon: data.icon || null,
    sort: data.sort || dynamicSubcategories.length * 10 + 10,
    status: data.status !== undefined ? data.status : 1,
    featureRouteMetric: !!data.featureRouteMetric,
    featureEndLocation: !!data.featureEndLocation,
    featureEquipment: !!data.featureEquipment,
    featureModel: !!data.featureModel,
    requireRealName: !!data.requireRealName,
  };
  dynamicSubcategories.push(newSub);
  return { code: 0, msg: '创建成功', data: id };
}

/**
 * 更新活动子类
 * PUT /admin-api/activity2/config/subcategory/update
 */
export async function updateActivitySubcategory(
  data: Partial<ActivitySubcategoryItem>,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/config/subcategory/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新活动子类失败，进行本地 Mock 处理', error);
  }

  const index = dynamicSubcategories.findIndex((s) => s.id === data.id);
  if (index >= 0) {
    dynamicSubcategories[index] = { ...dynamicSubcategories[index], ...data };
  }
  return { code: 0, msg: '更新成功', data: true };
}

/**
 * 删除活动子类
 * DELETE /admin-api/activity2/config/subcategory/delete
 */
export async function deleteActivitySubcategory(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/config/subcategory/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除活动子类失败，进行本地 Mock 处理', error);
  }

  dynamicSubcategories = dynamicSubcategories.filter((s) => s.id !== id);
  return { code: 0, msg: '删除成功', data: true };
}

export async function getActivityDetail(id: string): Promise<ApiResponse<ActivityDetailRespVO>> {
  try {
    const res = await request<ActivityDetailRespVO>({
      url: '/activity2/activity/get',
      method: 'GET',
      params: { id },
    });
    if (res && res.code === 0 && res.data) return res;
  } catch (error) {
    console.warn('获取活动详情失败，使用 Mock 降级', error);
  }

  const found = dynamicActivities.find((act) => act.id === id) || dynamicActivities[0];
  return { code: 0, msg: 'success', data: found };
}

export async function createActivity(data: ActivitySaveReqVO): Promise<ApiResponse<string>> {
  try {
    const res = await request<string>({
      url: '/activity2/activity/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建活动草稿异常，采用本地 Mock 生成', error);
  }

  const newId = `ACT_${Date.now()}`;
  const cover = data.images?.find((img) => img.isCover === 1)?.url || data.images?.[0]?.url || '';
  const sub = dynamicSubcategories.find((s) => s.id === data.subcategoryId);
  const cat = dynamicCategories.find((c) => c.id === (data.categoryId || sub?.categoryId));

  const newActivity: ActivityDetailRespVO = {
    ...data,
    id: newId,
    categoryId: cat?.id || data.categoryId || '',
    categoryName: cat?.name || '活动主题',
    subcategoryId: data.subcategoryId,
    subcategoryName: sub?.name || '综合活动',
    publisherUserId: data.publisherUserId || '100088',
    publisherNickname: '官方后台代发',
    publisherAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 0, // 默认草稿
    coverUrl: cover,
    currentEnrollCount: 0,
    feeAmount: data.feeAmount || 0,
    meetingPoints: data.meetingPoints || [],
    images: data.images || [],
    managers: data.managers || [],
    itineraries: data.itineraries || [],
    feeItems: data.feeItems || [],
    equipmentRefs: data.equipmentIds || [],
    models: data.models || [],
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  dynamicActivities.unshift(newActivity);
  return { code: 0, msg: '草稿创建成功', data: newId };
}

export async function updateActivity(data: ActivitySaveReqVO): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/activity/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新活动异常，采用本地 Mock 覆盖', error);
  }

  const index = dynamicActivities.findIndex((act) => act.id === data.id);
  if (index >= 0) {
    const old = dynamicActivities[index];
    const cover = data.images?.find((img) => img.isCover === 1)?.url || old.coverUrl;
    const sub = dynamicSubcategories.find((s) => s.id === data.subcategoryId);
    const cat = dynamicCategories.find((c) => c.id === (data.categoryId || sub?.categoryId));

    dynamicActivities[index] = {
      ...old,
      ...data,
      categoryId: cat?.id || data.categoryId || old.categoryId,
      categoryName: cat?.name || old.categoryName,
      subcategoryId: data.subcategoryId || old.subcategoryId,
      subcategoryName: sub?.name || old.subcategoryName,
      coverUrl: cover,
      meetingPoints: data.meetingPoints || [],
      images: data.images || [],
      managers: data.managers || [],
      itineraries: data.itineraries || [],
      feeItems: data.feeItems || [],
      equipmentRefs: data.equipmentIds || [],
      models: data.models || [],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }
  return { code: 0, msg: '更新成功', data: true };
}

export async function cancelActivity(id: string, reason: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/activity/cancel',
      method: 'PUT',
      data: { id, reason },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('取消活动异常，采用本地 Mock', error);
  }

  const target = dynamicActivities.find((act) => act.id === id);
  if (target) {
    target.status = 4; // 已取消
    target.rejectReason = reason;
    target.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  return { code: 0, msg: '活动已成功取消', data: true };
}

export async function deleteActivity(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/activity2/activity/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除活动异常，采用本地 Mock', error);
  }

  dynamicActivities = dynamicActivities.filter((act) => act.id !== id);
  return { code: 0, msg: '活动已物理删除', data: true };
}

export async function getActivitySummaryKPI(): Promise<ApiResponse<ActivitySummaryKPI>> {
  const list = dynamicActivities;
  const kpi: ActivitySummaryKPI = {
    totalCount: list.length,
    publishedCount: list.filter((a) => a.status === 1).length,
    inProgressCount: list.filter((a) => a.status === 2).length,
    auditingCount: list.filter((a) => a.status === 5).length,
    draftCount: list.filter((a) => a.status === 0).length,
    endedCount: list.filter((a) => a.status === 3).length,
    cancelledCount: list.filter((a) => a.status === 4).length,
    totalParticipants: list.reduce((acc, cur) => acc + (cur.currentEnrollCount || 0), 0),
    totalRevenue: list.reduce(
      (acc, cur) => acc + (cur.feeAmount || 0) * (cur.currentEnrollCount || 0),
      0,
    ),
  };
  return { code: 0, msg: 'success', data: kpi };
}
