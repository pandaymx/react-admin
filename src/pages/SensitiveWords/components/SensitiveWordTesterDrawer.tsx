import {
  CheckCircleOutlined,
  CopyOutlined,
  ExperimentOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Input,
  message,
  Select,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useState } from 'react';
import { validateSensitiveText } from '@/api/sensitiveWord';
import { useThemeStore } from '@/store/theme';
import type { SensitiveWordTestRespVO } from '@/types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SensitiveWordTesterDrawerProps {
  open: boolean;
  availableTags: string[];
  onClose: () => void;
}

const PRESET_EXAMPLES = [
  '快来加微信看片，每日精选高清福利视频更新中！',
  '居家兼职刷单轻松日赚三百，零门槛加群领红包666！',
  '你这个大傻逼智障脑残，去死全家暴毙吧！',
  '特价供应枪支弹药代发，货到付款保密发货。',
  '这是一篇记录周末郊游露营的摄影图文日记，风景怡人空气清新。',
];

export const SensitiveWordTesterDrawer: React.FC<SensitiveWordTesterDrawerProps> = ({
  open,
  availableTags,
  onClose,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const { token } = theme.useToken();

  const [inputText, setInputText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SensitiveWordTestRespVO | null>(null);

  const handleTest = async (textToTest?: string) => {
    const text = (textToTest !== undefined ? textToTest : inputText).trim();
    if (!text) {
      message.warning('请输入待检测的文本内容');
      return;
    }

    setLoading(true);
    try {
      const res = await validateSensitiveText({
        text,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      if (res.code === 200 || res.code === 0) {
        setResult(res.data);
      }
    } catch {
      message.error('检测失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: string) => {
    setInputText(preset);
    handleTest(preset);
  };

  const handleCopyReplaced = () => {
    if (!result?.replacedText) return;
    navigator.clipboard.writeText(result.replacedText);
    message.success('已复制脱敏后文本');
  };

  // 高亮显示原文中的敏感词
  const renderHighlightedText = () => {
    if (!inputText) return null;
    if (!result?.sensitiveWords || result.sensitiveWords.length === 0) {
      return <span style={{ color: token.colorText }}>{inputText}</span>;
    }

    // 按长度从长到短排序避免子串覆盖
    const sortedWords = [...result.sensitiveWords].sort((a, b) => b.length - a.length);
    const escaped = sortedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = inputText.split(regex);

    let offset = 0;
    return (
      <Paragraph style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 0 }}>
        {parts.map((part) => {
          const currentOffset = offset;
          offset += part.length;
          const isHit = sortedWords.some((w) => w.toLowerCase() === part.toLowerCase());
          return isHit ? (
            <mark
              key={`hit-${currentOffset}-${part}`}
              style={{
                backgroundColor: isDark ? 'rgba(255, 77, 79, 0.28)' : '#ffccc7',
                color: isDark ? '#ff7875' : '#cf1322',
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 600,
                border: `1px solid ${isDark ? 'rgba(255, 77, 79, 0.45)' : '#ffa39e'}`,
              }}
            >
              {part}
            </mark>
          ) : (
            <span key={`text-${currentOffset}-${part}`} style={{ color: token.colorText }}>
              {part}
            </span>
          );
        })}
      </Paragraph>
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#1677ff' }} />
          <span>敏感词在线文本校验测试台</span>
        </Space>
      }
      placement="right"
      size="large"
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 说明卡片 */}
        <Alert
          type="info"
          showIcon
          message="规则测试说明"
          description="输入评论、简介或作品文案，测试当前生效中的敏感词库匹配效果，直观预览命中词汇与自动脱敏效果。"
        />

        {/* 快捷示例 */}
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            💡 快速载入测试样本：
          </Text>
          <Space wrap size={[8, 8]}>
            {PRESET_EXAMPLES.map((sample, idx) => (
              <Tag
                key={sample}
                color={isDark ? 'processing' : 'blue'}
                style={{ cursor: 'pointer' }}
                onClick={() => handleApplyPreset(sample)}
              >
                样本 {idx + 1}
              </Tag>
            ))}
          </Space>
        </div>

        {/* 限制分类 */}
        <div>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
            限定标签范围（可选）
          </Text>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="默认检测全部开启的敏感词，也可指定特定分类"
            value={selectedTags}
            onChange={setSelectedTags}
            options={availableTags.map((tag) => ({ label: tag, value: tag }))}
          />
        </div>

        {/* 输入框 */}
        <div>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
            待检测文本
          </Text>
          <TextArea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="粘贴或输入待审核的文本内容..."
            maxLength={1000}
            showCount
          />
        </div>

        <Button
          type="primary"
          icon={<ExperimentOutlined />}
          loading={loading}
          onClick={() => handleTest()}
          style={{ width: '100%', height: 38 }}
        >
          立即开始文本风控检测
        </Button>

        <Divider style={{ margin: '8px 0' }} />

        {/* 结果呈现 */}
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: 14 }}>
                检测判定结果
              </Text>
              {result.hasSensitive ? (
                <Tag color="error" icon={<WarningOutlined />}>
                  包含敏感违规词汇 ({result.sensitiveWords.length} 处)
                </Tag>
              ) : (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  合规通过，未检测到敏感词
                </Tag>
              )}
            </div>

            {/* 命中敏感词汇总 */}
            {result.hasSensitive && (
              <Card
                size="small"
                title={
                  <span style={{ color: isDark ? '#ff7875' : '#cf1322', fontWeight: 600 }}>
                    命中敏感词清单 ({result.sensitiveWords.length})
                  </span>
                }
                style={{
                  background: isDark ? 'rgba(255, 77, 79, 0.12)' : '#fff1f0',
                  border: `1px solid ${isDark ? 'rgba(255, 77, 79, 0.3)' : '#ffccc7'}`,
                }}
                styles={{
                  header: {
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 77, 79, 0.2)' : '#ffe8e6'}`,
                  },
                }}
              >
                <Space wrap size={[6, 6]}>
                  {result.sensitiveWords.map((word) => (
                    <Tag
                      key={word}
                      color={isDark ? 'error' : 'red'}
                      style={{ fontWeight: 600, fontSize: 12, margin: 0 }}
                    >
                      {word}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {/* 原文高亮 */}
            <Card
              size="small"
              title="原文敏感词高亮标注"
              style={{
                background: token.colorBgContainer,
                borderColor: token.colorBorderSecondary,
              }}
            >
              <div
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
                  border: `1px solid ${token.colorBorderSecondary}`,
                  padding: '10px 14px',
                  borderRadius: 6,
                }}
              >
                {renderHighlightedText()}
              </div>
            </Card>

            {/* 脱敏替换 */}
            {result.hasSensitive && (
              <Card
                size="small"
                title="自动脱敏建议替换效果"
                style={{
                  background: token.colorBgContainer,
                  borderColor: token.colorBorderSecondary,
                }}
                extra={
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopyReplaced}
                  >
                    复制脱敏文本
                  </Button>
                }
              >
                <div
                  style={{
                    background: isDark ? 'rgba(82, 196, 26, 0.12)' : '#f6ffed',
                    border: `1px solid ${isDark ? 'rgba(82, 196, 26, 0.28)' : '#b7eb8f'}`,
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: isDark ? '#95de64' : '#389e0d',
                    wordBreak: 'break-all',
                    lineHeight: 1.6,
                  }}
                >
                  {result.replacedText}
                </div>
              </Card>
            )}

            {!result.hasSensitive && (
              <Card
                size="small"
                style={{
                  background: isDark ? 'rgba(82, 196, 26, 0.1)' : '#f6ffed',
                  border: `1px solid ${isDark ? 'rgba(82, 196, 26, 0.25)' : '#b7eb8f'}`,
                }}
              >
                <Text style={{ color: isDark ? '#95de64' : '#389e0d', fontSize: 13 }}>
                  ✅ 经系统风控检测，该文本内容未触发生效中的任何敏感词规则，可正常放行。
                </Text>
              </Card>
            )}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入文本后点击检测查看结果" />
        )}
      </div>
    </Drawer>
  );
};
