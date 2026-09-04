/**
 * 格式化后端返回的时间字段 (兼容毫秒时间戳 number、ISO 字符串 string、LocalDateTime 数组 [y,m,d,h,m,s]、null/undefined)
 */
export const formatDateTime = (val: any): string => {
  if (val === null || val === undefined || val === '') return '-';

  // 数字时间戳 (如 1725264300000 或秒级时间戳 1725264300)
  if (typeof val === 'number') {
    const timestamp = val < 10000000000 ? val * 1000 : val;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return String(val);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  // 数组格式 [2026, 9, 2, 10, 45, 0] (Java LocalDateTime 默认 Jackson 序列化数组)
  if (Array.isArray(val)) {
    const [y, m, d, h = 0, min = 0, s = 0] = val;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:${pad(s)}`;
  }

  // 字符串格式 (如纯数字时间戳 "1725264300000" 或 "2026-09-02T10:45:00" 或 "2026-09-02 10:45:00")
  if (typeof val === 'string') {
    if (/^\d{10,13}$/.test(val)) {
      const num = Number(val);
      const timestamp = num < 10000000000 ? num * 1000 : num;
      const date = new Date(timestamp);
      if (!Number.isNaN(date.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      }
    }
    return val.replace('T', ' ').slice(0, 19);
  }

  return String(val);
};

/**
 * 计算封禁到期剩余时间
 */
export interface BanRemainingInfo {
  text: string;
  fullDesc: string;
  isExpired: boolean;
  isPermanent: boolean;
}

export const formatBanRemainingTime = (expireTime?: string): BanRemainingInfo => {
  if (!expireTime) {
    return {
      text: '',
      fullDesc: '未封禁',
      isExpired: true,
      isPermanent: false,
    };
  }

  if (expireTime === 'permanent') {
    return {
      text: '永久封禁',
      fullDesc: '永久限制该功能权限',
      isExpired: false,
      isPermanent: true,
    };
  }

  const expire = new Date(expireTime).getTime();
  const now = Date.now();
  const diff = expire - now;

  if (diff <= 0) {
    return {
      text: '已到期解封',
      fullDesc: `已于 ${expireTime} 到期自动解封`,
      isExpired: true,
      isPermanent: false,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (days > 0) {
    text = `剩 ${days} 天${hours > 0 ? ` ${hours} 小时` : ''}`;
  } else if (hours > 0) {
    text = `剩 ${hours} 小时${mins > 0 ? ` ${mins} 分` : ''}`;
  } else {
    text = `剩 ${Math.max(1, mins)} 分钟`;
  }

  return {
    text,
    fullDesc: `封禁到期时间: ${expireTime} (${text})`,
    isExpired: false,
    isPermanent: false,
  };
};
