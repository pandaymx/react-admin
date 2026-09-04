import {
  ExclamationCircleFilled,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Image,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';

import type {
  PenaltyAction,
  ReportItem,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@/types';

const { Text, Paragraph } = Typography;

interface ReportDetailDrawerProps {
  open: boolean;
  report: ReportItem | null;
  onClose: () => void;
  onHandleClick?: () => void;
}

export const ReportDetailDrawer: React.FC<ReportDetailDrawerProps> = ({
  open,
  report,
  onClose,
  onHandleClick,
}) => {
  const { token } = theme.useToken();
  const renderReasonTag = (reason: ReportReason) => {
    const map: Record<ReportReason, { label: string; color: string }> = {
      illegal: { label: '违法违禁', color: 'red' },
      porn: { label: '色情低俗', color: 'volcano' },
      abuse: { label: '侮辱谩骂/网暴', color: 'magenta' },
      ad_fraud: { label: '营销广告/欺诈', color: 'orange' },
      copyright: { label: '抄袭侵权', color: 'purple' },
      rumor: { label: '不实谣言', color: 'geekblue' },
      gambling: { label: '涉赌涉诈', color: 'red' },
      other: { label: '其他违规', color: 'default' },
    };
    const item = map[reason] || { label: '其他', color: 'default' };
    return <Tag color={item.color}>{item.label}</Tag>;
  };

  const renderStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge status="processing" text={<Text style={{ color: '#1677ff' }}>待审核处理</Text>} />
        );
      case 'processed':
        return <Badge status="success" text={<Text type="success">违规已处置</Text>} />;
      case 'rejected':
        return <Badge status="error" text={<Text type="danger">已驳回举报</Text>} />;
      case 'ignored':
        return <Badge status="default" text={<Text type="secondary">已忽略</Text>} />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const renderPenaltyTag = (action?: PenaltyAction) => {
    switch (action) {
      case 'ban_post':
        return <Tag color="error">违规下架作品</Tag>;
      case 'delete_comment':
        return <Tag color="error">违规隐藏评论</Tag>;
      case 'mute_user':
        return <Tag color="warning">用户禁言处罚</Tag>;
      case 'ban_user':
        return <Tag color="red">用户封禁账号</Tag>;
      case 'warn_user':
        return <Tag color="gold">下发警告信</Tag>;
      case 'none':
        return <Tag color="default">无处罚</Tag>;
      default:
        return <Text type="secondary">-</Text>;
    }
  };

  const renderTargetTypeTag = (type: ReportTargetType) => {
    switch (type) {
      case 'post':
        return (
          <Tag color="purple" icon={<FileTextOutlined />}>
            作品/帖子
          </Tag>
        );
      case 'comment':
        return (
          <Tag color="cyan" icon={<MessageOutlined />}>
            评论互动
          </Tag>
        );
      case 'user':
        return (
          <Tag color="blue" icon={<UserOutlined />}>
            用户账号
          </Tag>
        );
      default:
        return <Tag>其他</Tag>;
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <ExclamationCircleFilled style={{ color: '#fa8c16' }} />
          <span>举报工单全景与证据核查</span>
        </Space>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      extra={
        report?.status === 'pending' && (
          <Button type="primary" onClick={onHandleClick}>
            立即处理
          </Button>
        )
      }
    >
      {report && (
        <div>
          {/* 状态与基础概览 */}
          <Card
            size="small"
            style={{ marginBottom: 16, backgroundColor: token.colorFillAlter, borderRadius: 8 }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="举报工单号">
                <Text code copyable>
                  {report.id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="处理状态">
                {renderStatusBadge(report.status)}
              </Descriptions.Item>
              <Descriptions.Item label="举报类型">
                {renderTargetTypeTag(report.targetType)}
              </Descriptions.Item>
              <Descriptions.Item label="违规原因">
                {renderReasonTag(report.reason)}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">{report.createTime}</Descriptions.Item>
              <Descriptions.Item label="处置措施">
                {renderPenaltyTag(report.penaltyAction)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 举报人诉求与描述 */}
          <Descriptions
            title="举报人信息与陈述"
            bordered
            size="small"
            column={2}
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="举报人昵称">
              <Space size={6}>
                <Avatar src={report.reporter.avatar} size={24} icon={<UserOutlined />} />
                <Text strong>{report.reporter.nickname}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="举报人 UID">
              <Text code>{report.reporter.uid || report.reporter.userNo}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="违规陈述说明" span={2}>
              <Paragraph style={{ margin: 0, color: '#cf1322' }}>{report.reasonDesc}</Paragraph>
            </Descriptions.Item>
          </Descriptions>

          {/* 证据材料影像 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              举报人提交证据材料截图
            </div>
            {report.evidenceImages?.length > 0 ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {report.evidenceImages.map((img) => (
                  <Image
                    key={img}
                    src={img}
                    alt="证据截图"
                    style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 6 }}
                  />
                ))}
              </div>
            ) : (
              <Text type="secondary">举报人未上传附加证据截图</Text>
            )}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 被举报目标上下文 */}
          <Descriptions
            title="被举报目标原始内容"
            bordered
            size="small"
            column={2}
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="被举报主体">
              <Space size={6}>
                <Avatar src={report.target.targetUser.avatar} size={24} icon={<UserOutlined />} />
                <Text strong>{report.target.targetUser.nickname}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="被举报人 UID">
              <Text code>{report.target.targetUser.uid || report.target.targetUser.userNo}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="目标标识 ID" span={2}>
              <Text code>{report.target.targetId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="内容概要 / 正文" span={2}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {report.target.coverUrl && (
                  <img
                    src={report.target.coverUrl}
                    alt="目标封面"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Paragraph style={{ margin: 0 }}>
                  {report.target.titleOrContent || '无文本内容'}
                </Paragraph>
              </div>
            </Descriptions.Item>
          </Descriptions>

          {/* 处理结论与备注 */}
          {report.status !== 'pending' && (
            <Descriptions title="风控处置审核记录" bordered size="small" column={2}>
              <Descriptions.Item label="处理人员">
                {report.handler || '系统管理员'}
              </Descriptions.Item>
              <Descriptions.Item label="处理时间">{report.handleTime}</Descriptions.Item>
              <Descriptions.Item label="处置处理说明" span={2}>
                <Paragraph style={{ margin: 0 }}>{report.handleRemark || '无特别说明'}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default ReportDetailDrawer;
