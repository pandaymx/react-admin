import { CheckCircleFilled, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Modal, message, Spin, Typography, theme } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkCaptchaApi, getCaptchaApi } from '@/api/auth';
import type { CaptchaGetRespVO } from '@/types';
import { encryptCaptchaPoint } from '@/utils/captcha';

const { Text } = Typography;

interface SlideCaptchaModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (captchaVerification: string) => void;
}

// AJ-Captcha 官方标准尺寸：背景宽 310px，高 155px；滑块宽 47px，高 155px
const CANVAS_WIDTH = 310;
const CANVAS_HEIGHT = 155;
const JIGSAW_WIDTH = 47;
const SLIDER_HANDLE_WIDTH = 40;
const MAX_MOVE = CANVAS_WIDTH - JIGSAW_WIDTH; // 263px

export const SlideCaptchaModal: React.FC<SlideCaptchaModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const { token: antdTheme } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [captchaData, setCaptchaData] = useState<CaptchaGetRespVO['repData'] | null>(null);

  // 滑块拖动状态
  const [isDragging, setIsDragging] = useState(false);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [status, setStatus] = useState<'default' | 'success' | 'error'>('default');

  const startXRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // 获取验证码图片
  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    setStatus('default');
    setSliderLeft(0);
    try {
      const res = await getCaptchaApi({ captchaType: 'blockPuzzle' });
      const rawData = (res as any)?.repData || (res as any)?.data?.repData || (res as any)?.data;
      const repCode = (res as any)?.repCode || (res as any)?.data?.repCode;

      if (
        (repCode === '0000' || res.code === 200 || res.code === 0) &&
        rawData &&
        (rawData.originalImageBase64 || rawData.jigsawImageBase64)
      ) {
        setCaptchaData(rawData);
      } else {
        // 服务端离线或测试模式容灾
        setCaptchaData({
          originalImageBase64: '',
          jigsawImageBase64: '',
          token: `mock_token_${Date.now()}`,
          secretKey: 'mock_secret_key',
        });
      }
    } catch {
      // 离线容灾
      setCaptchaData({
        originalImageBase64: '',
        jigsawImageBase64: '',
        token: `mock_token_${Date.now()}`,
        secretKey: 'mock_secret_key',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCaptcha();
    } else {
      setSliderLeft(0);
      setStatus('default');
      setIsDragging(false);
    }
  }, [open, loadCaptcha]);

  // 校验滑动位置
  const verifyPosition = useCallback(
    async (moveX: number) => {
      if (!captchaData) return;
      setChecking(true);

      try {
        // 若是真实的 AJ-Captcha 后端图片
        if (captchaData.originalImageBase64) {
          const pointJson = JSON.stringify({ x: Math.round(moveX), y: 5.0 });
          const encryptedPoint = encryptCaptchaPoint(pointJson, captchaData.secretKey);

          const res = await checkCaptchaApi({
            captchaType: 'blockPuzzle',
            pointJson: encryptedPoint,
            token: captchaData.token,
          });

          const repCode = (res as any)?.repCode || (res as any)?.data?.repCode;
          const rawData =
            (res as any)?.repData || (res as any)?.data?.repData || (res as any)?.data;
          const isCheckPass = repCode === '0000' || rawData?.result === true;

          // 后端校验通过
          if (isCheckPass) {
            // AJ-Captcha 官方协议：生成 AES(token + "---" + pointJson) 作为最终登录验证凭据
            const captchaVerification =
              rawData?.captchaVerification ||
              encryptCaptchaPoint(`${captchaData.token}---${pointJson}`, captchaData.secretKey);

            setStatus('success');
            message.success('安全验证通过');
            setTimeout(() => {
              onSuccess(captchaVerification);
            }, 300);
            return;
          }

          // 验证失败（滑块未对齐）
          setStatus('error');
          const failMsg =
            (res as any)?.repMsg || (res as any)?.data?.repMsg || '滑动未对准缺口，请重试';
          message.error(failMsg);
          setTimeout(() => {
            loadCaptcha();
          }, 600);
          return;
        } else {
          // 离线/演示容灾：滑动超过 50px 即判定通过
          if (moveX > 50) {
            setStatus('success');
            const mockVerification = `${captchaData.token}---mock_verification_${Date.now()}`;
            setTimeout(() => {
              onSuccess(mockVerification);
            }, 300);
            return;
          }
        }

        // 验证失败
        setStatus('error');
        setTimeout(() => {
          loadCaptcha();
        }, 500);
      } catch {
        setStatus('error');
        setTimeout(() => {
          loadCaptcha();
        }, 500);
      } finally {
        setChecking(false);
      }
    },
    [captchaData, onSuccess, loadCaptcha],
  );

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (loading || checking || status === 'success') return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX - sliderLeft;
  };

  // 拖动中与松开监听
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      let moveX = clientX - startXRef.current;
      if (moveX < 0) moveX = 0;
      if (moveX > MAX_MOVE) moveX = MAX_MOVE;
      setSliderLeft(moveX);
    };

    const handleMouseUp = async () => {
      if (!isDragging) return;
      setIsDragging(false);
      await verifyPosition(sliderLeft);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, sliderLeft, verifyPosition]);

  const getImgSrc = (base64Str?: string) => {
    if (!base64Str) return '';
    return base64Str.startsWith('data:') ? base64Str : `data:image/png;base64,${base64Str}`;
  };

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      width={360}
      centered
      destroyOnHidden
      styles={{
        body: {
          padding: '20px 24px',
          borderRadius: 12,
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          安全验证
        </Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={loadCaptcha}
            loading={loading}
            title="刷新验证码"
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onCancel}
            title="关闭"
          />
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          margin: '0 auto',
          background: '#f5f5f5',
          borderRadius: 8,
          overflow: 'hidden',
          boxSizing: 'content-box',
        }}
      >
        {loading ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin description="加载验证码中..." />
          </div>
        ) : captchaData?.originalImageBase64 ? (
          <>
            {/* 背景大图：精准 310x155 像素 1:1 渲染 */}
            <img
              src={getImgSrc(captchaData.originalImageBase64)}
              alt="captcha-bg"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />

            {/* 拼图滑块：GPU 硬件加速 transform 移动，清晰可见 */}
            <img
              src={getImgSrc(captchaData.jigsawImageBase64)}
              alt="captcha-block"
              width={JIGSAW_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${JIGSAW_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                transform: `translateX(${sliderLeft}px)`,
                zIndex: 10,
                pointerEvents: 'none',
                userSelect: 'none',
                transition: isDragging ? 'none' : 'transform 0.2s ease',
              }}
            />
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1677ff15, #52c41a15)',
            }}
          >
            <Text style={{ fontSize: 13, color: '#595959' }}>拖动滑块完成拼图验证</Text>
            <div
              style={{
                marginTop: 8,
                width: 48,
                height: 48,
                borderRadius: 8,
                background: '#1677ff',
                opacity: 0.8,
                transform: `translateX(${(sliderLeft / MAX_MOVE) * 120 - 60}px)`,
              }}
            />
          </div>
        )}

        {/* 成功遮罩 */}
        {status === 'success' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(82, 196, 26, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              zIndex: 20,
            }}
          >
            <CheckCircleFilled style={{ fontSize: 24, marginRight: 8 }} /> 验证成功
          </div>
        )}
      </div>

      {/* 滑动轨道与滑块 */}
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          width: `${CANVAS_WIDTH}px`,
          height: '40px',
          margin: '16px auto 0',
          background: '#f0f0f0',
          borderRadius: 20,
          userSelect: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
          border: `1px solid ${status === 'error' ? '#ff4d4f' : status === 'success' ? '#52c41a' : '#d9d9d9'}`,
        }}
      >
        {/* 滑过的高亮条 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${sliderLeft + SLIDER_HANDLE_WIDTH / 2}px`,
            background:
              status === 'error'
                ? '#ff4d4f30'
                : status === 'success'
                  ? '#52c41a30'
                  : `${antdTheme.colorPrimary}25`,
            transition: isDragging ? 'none' : 'width 0.2s ease',
          }}
        />

        {/* 提示文案 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#8c8c8c',
            pointerEvents: 'none',
          }}
        >
          {status === 'error'
            ? '验证失败，请重试'
            : status === 'success'
              ? '验证通过'
              : '按住滑块，拖动完成拼图'}
        </div>

        {/* 拖拽手柄 */}
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={MAX_MOVE}
          aria-valuenow={sliderLeft}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${SLIDER_HANDLE_WIDTH}px`,
            height: '38px',
            borderRadius: 19,
            background:
              status === 'error'
                ? '#ff4d4f'
                : status === 'success'
                  ? '#52c41a'
                  : antdTheme.colorPrimary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 15,
            transform: `translateX(${sliderLeft}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
        >
          {status === 'success' ? '✓' : status === 'error' ? '✕' : '➔'}
        </div>
      </div>
    </Modal>
  );
};
