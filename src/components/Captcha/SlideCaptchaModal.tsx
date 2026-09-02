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

const CANVAS_WIDTH = 310;
const SLIDER_HANDLE_WIDTH = 40;
const MAX_MOVE = CANVAS_WIDTH - SLIDER_HANDLE_WIDTH;

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
      if (
        (res.code === 200 || res.code === 0 || res.data?.repCode === '0000') &&
        res.data?.repData
      ) {
        setCaptchaData(res.data.repData);
      } else {
        // 若服务端未配置验证码，生成前端模拟拼图容灾
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

          const verification = res.data?.repData?.captchaVerification;
          if (
            (res.code === 200 || res.code === 0 || res.data?.repCode === '0000') &&
            verification
          ) {
            setStatus('success');
            message.success('安全验证通过');
            setTimeout(() => {
              onSuccess(verification);
            }, 400);
            return;
          }
        } else {
          // 离线/演示容灾：只要滑动超过 50px 即判定成功
          if (moveX > 50) {
            setStatus('success');
            const mockVerification = `${captchaData.token}---mock_verification_${Date.now()}`;
            setTimeout(() => {
              onSuccess(mockVerification);
            }, 400);
            return;
          }
        }

        // 验证失败
        setStatus('error');
        setTimeout(() => {
          loadCaptcha();
        }, 600);
      } catch {
        setStatus('error');
        setTimeout(() => {
          loadCaptcha();
        }, 600);
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

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      width={360}
      centered
      destroyOnClose
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
          width: CANVAS_WIDTH,
          height: 155,
          margin: '0 auto',
          background: '#f5f5f5',
          borderRadius: 8,
          overflow: 'hidden',
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
            <Spin tip="加载验证码中..." />
          </div>
        ) : captchaData?.originalImageBase64 ? (
          <>
            {/* 背景大图 */}
            <img
              src={
                captchaData.originalImageBase64.startsWith('data:')
                  ? captchaData.originalImageBase64
                  : `data:image/png;base64,${captchaData.originalImageBase64}`
              }
              alt="captcha-bg"
              style={{ width: CANVAS_WIDTH, height: 155, display: 'block', objectFit: 'cover' }}
            />

            {/* 拼图滑块 */}
            <img
              src={
                captchaData.jigsawImageBase64.startsWith('data:')
                  ? captchaData.jigsawImageBase64
                  : `data:image/png;base64,${captchaData.jigsawImageBase64}`
              }
              alt="captcha-block"
              style={{
                position: 'absolute',
                top: 0,
                left: sliderLeft,
                height: 155,
                zIndex: 2,
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'left 0.2s ease',
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
              zIndex: 10,
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
          width: CANVAS_WIDTH,
          height: 40,
          margin: '16px auto 0',
          background: '#f0f0f0',
          borderRadius: 20,
          userSelect: 'none',
          overflow: 'hidden',
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
            width: sliderLeft + SLIDER_HANDLE_WIDTH / 2,
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
            left: sliderLeft,
            top: 0,
            width: SLIDER_HANDLE_WIDTH,
            height: 38,
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
            zIndex: 5,
            transition: isDragging ? 'none' : 'left 0.2s ease',
          }}
        >
          {status === 'success' ? '✓' : status === 'error' ? '✕' : '➔'}
        </div>
      </div>
    </Modal>
  );
};
