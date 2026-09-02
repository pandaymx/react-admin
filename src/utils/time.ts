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
  // 模拟当前基准时间（2026-09-02）或实时时间
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
