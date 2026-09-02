import CryptoJS from 'crypto-js';

/**
 * AJ-Captcha 坐标数据 AES 加密 (ECB 模式，Pkcs7 填充)
 * 对接 Yudao 后端 system/captcha/check 校验
 */
export const encryptCaptchaPoint = (pointJson: string, secretKey?: string): string => {
  if (!secretKey) return pointJson;
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const src = CryptoJS.enc.Utf8.parse(pointJson);
    const encrypted = CryptoJS.AES.encrypt(src, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (err) {
    console.error('Captcha point encryption failed:', err);
    return pointJson;
  }
};
