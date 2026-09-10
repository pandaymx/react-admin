import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Divider,
  Input,
  Modal,
  message,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { updateUserTags } from '@/api/user';
import type { UserItem } from '@/types';

const { Text } = Typography;

interface UserTagsEditModalProps {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
  onSuccess: (updatedTags: string[]) => void;
}

// 对齐数据库 qxj 的 tag_type 与 tag 表真实标签字典（按业务类目分组）
export const PRESET_TAG_GROUPS: Array<{
  category: string;
  color: string;
  tags: string[];
}> = [
  {
    category: '个性派',
    color: 'geekblue',
    tags: [
      '剧本杀',
      '桌游',
      '手工DIY',
      '手帐',
      '木工',
      '烘培',
      '客制化',
      '假面骑士',
      '数码宝贝',
      '洛丽塔',
    ],
  },
  {
    category: '汪星',
    color: 'orange',
    tags: [
      '柯基',
      '阿拉斯加',
      '沙皮',
      '哈士奇',
      '金毛',
      '柴犬',
      '边牧',
      '萨摩耶',
      '雪纳瑞',
      '法斗',
      '泰迪',
    ],
  },
  {
    category: '喵星',
    color: 'purple',
    tags: ['暹罗', '布偶', '加菲', '英短', '美短', '波斯', '无毛猫', '缅因', '豹猫', '金渐层'],
  },
  {
    category: '异宠',
    color: 'cyan',
    tags: [
      '土拨鼠',
      '花枝鼠',
      '荷兰猪',
      '仓鼠',
      '刺猬',
      '宠物兔',
      '守宫',
      '宠物貂',
      '蜜袋鼯',
      '龙猫',
    ],
  },
  {
    category: '艺术',
    color: 'magenta',
    tags: ['哲学', '中国画', '书法', '动漫', '手机摄影', '民谣', '油画', '吉他', '散文', '舞蹈'],
  },
  {
    category: '乐器',
    color: 'gold',
    tags: ['钢琴', '古筝', '小提琴', '尤克里里', '二胡', '手风琴', '架子鼓', '双簧管', '琵琶'],
  },
  {
    category: '运动',
    color: 'green',
    tags: ['乒乓球', '羽毛球', '网球', '骑行', '滑雪', '冲浪', '攀岩', '潜水', '徒步', '健身'],
  },
];

export const UserTagsEditModal: React.FC<UserTagsEditModalProps> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const {
    token: { colorPrimary, colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open && user) {
      setSelectedTags([...(user.tags || [])]);
      setCustomTagInput('');
    }
  }, [open, user]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (selectedTags.includes(trimmed)) {
      message.info('该标签已存在');
      return;
    }
    if (trimmed.length > 12) {
      message.warning('标签名称不能超过12个字');
      return;
    }
    setSelectedTags([...selectedTags, trimmed]);
    setCustomTagInput('');
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await updateUserTags(user.id || user.userId, selectedTags);
      message.success(`已更新用户【${user.nickname}】的标签配置`);
      onSuccess(selectedTags);
      onClose();
    } catch (err) {
      console.error(err);
      message.error('保存用户标签失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space align="center" size={10}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${colorPrimary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TagOutlined style={{ color: colorPrimary, fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>配置用户业务标签</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              为用户关联兴趣、资质与运营分类标签，驱动活动匹配与定向推荐
            </Text>
          </div>
        </Space>
      }
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      okText="保存标签配置"
      cancelText="取消"
      width={680}
      destroyOnClose
    >
      {user && (
        <div>
          {/* 用户基础信息卡片 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: `${colorPrimary}08`,
              border: `1px solid ${colorPrimary}20`,
              marginBottom: 16,
            }}
          >
            <Space size={12} align="center">
              <Avatar src={user.avatarUrl || user.avatar} size={42} />
              <div>
                <Space size={6} align="center">
                  <Text strong style={{ fontSize: 14 }}>
                    {user.nickname}
                  </Text>
                  <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
                    UID: {user.userId || user.uid}
                  </Tag>
                </Space>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                  手机号: {user.phoneNumber || user.phone || '—'} · 认证状态:{' '}
                  {user.certificationLabel}
                </div>
              </div>
            </Space>

            <Button
              size="small"
              onClick={() => setSelectedTags([])}
              disabled={selectedTags.length === 0}
            >
              清空已选
            </Button>
          </div>

          {/* 当前已选标签池 */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>
                已选标签 ({selectedTags.length})：
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                点击标签右侧 ✕ 即可移除
              </Text>
            </div>

            <div
              style={{
                minHeight: 52,
                padding: '8px 12px',
                borderRadius: 8,
                background: colorBgContainer,
                border: `1px dashed ${colorBorderSecondary}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                alignItems: 'center',
              }}
            >
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Tag
                    key={tag}
                    color="processing"
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    style={{ fontSize: 12, padding: '2px 8px', margin: 0 }}
                  >
                    {tag}
                  </Tag>
                ))
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  暂未添加任何标签，请在下方点击选择推荐标签或输入自定义标签
                </Text>
              )}
            </div>
          </div>

          {/* 自定义输入标签 */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
              自定义添加新标签：
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入标签名称 (如: 桨板爱好者、飞盘队长)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onPressEnter={handleAddCustomTag}
                maxLength={12}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomTag}>
                添加至用户
              </Button>
            </Space.Compact>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 推荐标签分类选择区 */}
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
              系统推荐标签字典（点击即可快速打标 / 取消）：
            </Text>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              {PRESET_TAG_GROUPS.map((group) => (
                <div key={group.category}>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}
                  >
                    ● {group.category}
                  </Text>
                  <Space size={[6, 6]} wrap>
                    {group.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <Tag.CheckableTag
                          key={tag}
                          checked={isSelected}
                          onChange={() => handleToggleTag(tag)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            border: isSelected ? undefined : `1px solid ${colorBorderSecondary}`,
                          }}
                        >
                          {isSelected ? `✓ ${tag}` : tag}
                        </Tag.CheckableTag>
                      );
                    })}
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
