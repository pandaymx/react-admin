import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MinusCircleFilled,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Image,
  Input,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { getPersonalVerificationList, getVerificationSummaryStats } from '@/api/verification';
import type {
  AuditStatus,
  IdCardType,
  PersonalVerificationItem,
  VerificationQueryParams,
  VerificationSummaryStats,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatDateTime } from '@/utils/time';
import { AuditModal } from './AuditModal';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export const PersonalVerification: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<PersonalVerificationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 统计概览数据
  const [summaryStats, setSummaryStats] = useState<VerificationSummaryStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0,
  });

  // 证件号脱敏控制，记录用户手动展开查看的记录 ID 集合
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // 抽屉详情
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<PersonalVerificationItem | null>(null);

  // 审核弹窗
  const [auditModalVisible, setAuditModalVisible] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<PersonalVerificationItem | null>(null);

  // 拉取统计概览
  const fetchStats = useCallback(async () => {
    try {
      const res = await getVerificationSummaryStats('personal');
      if (res.code === 200 && res.data) {
        setSummaryStats(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 数据拉取
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: VerificationQueryParams = {
          keyword: values.keyword,
          uid: values.uid,
          userNo: values.uid,
          userId: values.uid,
          idCardNo: values.idCardNo,
          idCardType: values.idCardType,
          status: values.status,
          page,
          pageNo: page,
          pageSize: size,
        };

        if (values.dateRange && values.dateRange.length === 2) {
          params.dateRange = [
            values.dateRange[0].format('YYYY-MM-DD'),
            values.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const res = await getPersonalVerificationList(params);
        if (res.code === 200) {
          setDataList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取个人认证列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  useEffect(() => {
    fetchData(1, 10);
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleSearch = () => {
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 点击指标卡片快捷筛选状态
  const handleQuickFilterStatus = (status: AuditStatus | 'all') => {
    form.setFieldsValue({ status });
    fetchData(1, pageSize);
  };

  // 切换证件号明文/密文
  const toggleRevealId = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 格式化脱敏证件号
  const formatMaskedIdCard = (idCardNo: string, isRevealed: boolean) => {
    if (isRevealed || !idCardNo || idCardNo.length < 8) {
      return idCardNo;
    }
    const prefix = idCardNo.slice(0, 6);
    const suffix = idCardNo.slice(-4);
    const mask = '*'.repeat(Math.max(4, idCardNo.length - 10));
    return `${prefix}${mask}${suffix}`;
  };

  // 手机号脱敏
  const formatMaskedPhone = (phone?: string, isRevealed = false) => {
    if (!phone) return '未绑定手机';
    if (isRevealed) return phone;
    return phone
      .replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
      .replace(/^(\d{3,4}-)\d{4}(\d{4})$/, '$1****$2');
  };

  // 证件类型 Tag
  const renderIdCardTypeTag = (type: IdCardType) => {
    switch (type) {
      case 'id_card':
        return <Tag color="blue">居民身份证</Tag>;
      case 'passport':
        return <Tag color="purple">护照</Tag>;
      case 'hk_mo_pass':
        return <Tag color="cyan">港澳通行证</Tag>;
      case 'tw_pass':
        return <Tag color="orange">台湾通行证</Tag>;
      default:
        return <Tag>权威证件</Tag>;
    }
  };

  // 认证状态 Badge
  const renderAuditStatus = (status: AuditStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            status="processing"
            text={
              <Text style={{ color: '#1677ff' }}>
                <ClockCircleFilled style={{ marginRight: 4 }} />
                待审核
              </Text>
            }
          />
        );
      case 'approved':
        return (
          <Badge
            status="success"
            text={
              <Text type="success">
                <CheckCircleFilled style={{ marginRight: 4 }} />
                已通过
              </Text>
            }
          />
        );
      case 'rejected':
        return (
          <Badge
            status="error"
            text={
              <Text type="danger">
                <CloseCircleFilled style={{ marginRight: 4 }} />
                已驳回
              </Text>
            }
          />
        );
      case 'revoked':
        return (
          <Badge
            status="default"
            text={
              <Text type="secondary">
                <MinusCircleFilled style={{ marginRight: 4 }} />
                已撤销
              </Text>
            }
          />
        );
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  // 导出个人认证列表
  const handleExport = () => {
    setExportLoading(true);
    try {
      if (!dataList.length) {
        message.warning('当前列表无数据可导出');
        return;
      }
      exportToCsv(
        [
          { title: '申请/档案编号', key: 'id' },
          { title: '用户UID', key: 'uid' },
          { title: '昵称', key: 'nickname' },
          { title: '真实姓名', key: 'realName' },
          {
            title: '证件类型',
            key: 'idCardType',
            render: (r) => {
              const map: Record<IdCardType, string> = {
                id_card: '居民身份证',
                passport: '护照',
                hk_mo_pass: '港澳通行证',
                tw_pass: '台湾通行证',
              };
              return map[r.idCardType] || '居民身份证';
            },
          },
          { title: '证件号码', key: 'idCardNo' },
          {
            title: '认证状态',
            key: 'status',
            render: (r) => {
              const map: Record<AuditStatus, string> = {
                pending: '待审核',
                approved: '已通过',
                rejected: '已驳回',
                revoked: '已撤销',
              };
              return map[r.status] || '未知';
            },
          },
          {
            title: '认证渠道/来源',
            key: 'source',
            render: (r) => (r.isManualReview ? '人工待审工单' : '三方自动实名核验'),
          },
          { title: '认证申请时间', key: 'verifyTime' },
          { title: '联系电话', key: 'phone', render: (r) => formatMaskedPhone(r.phone, false) },
          { title: '审核人员', key: 'auditor' },
          { title: '审核时间', key: 'auditTime' },
          { title: '审核说明/原因', key: 'auditRemark' },
        ],
        dataList,
        '个人实名认证管理列表',
      );
      message.success(`成功导出 ${dataList.length} 条个人认证记录`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 个人认证表格列定义
  const columns: TableProps<PersonalVerificationItem>['columns'] = [
    {
      title: '编号与标识',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id: string, record) => (
        <div>
          <div>
            <Text code copyable={{ tooltips: ['复制编号', '已复制'] }} style={{ fontSize: 12 }}>
              {id}
            </Text>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.userNo || record.uid}
            </Text>
          </div>
          <div style={{ marginTop: 2 }}>
            {record.isManualReview ? (
              <Tag color="gold" style={{ fontSize: 10, lineHeight: '18px', padding: '0 4px' }}>
                人工审核单
              </Tag>
            ) : (
              <Tag color="cyan" style={{ fontSize: 10, lineHeight: '18px', padding: '0 4px' }}>
                已认证档案
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '用户信息',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 180,
      render: (nickname: string, record) => (
        <Space size={10}>
          <Avatar src={record.avatar} size={38} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              {nickname}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatMaskedPhone(record.phone || record.contactPhone, false)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 110,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '证件号',
      dataIndex: 'idCardNo',
      key: 'idCardNo',
      width: 210,
      render: (idCardNo: string, record) => {
        const isRevealed = !!revealedIds[record.id];
        return (
          <Space size={4}>
            <Text
              code
              copyable={{ text: idCardNo, tooltips: ['复制证件号', '已复制'] }}
              style={{ fontSize: 12 }}
            >
              {formatMaskedIdCard(idCardNo, isRevealed)}
            </Text>
            {idCardNo && idCardNo.length >= 8 && (
              <Button
                type="text"
                size="small"
                icon={isRevealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => toggleRevealId(record.id)}
                style={{ color: '#8c8c8c' }}
              />
            )}
          </Space>
        );
      },
    },
    {
      title: '证件类型',
      dataIndex: 'idCardType',
      key: 'idCardType',
      width: 120,
      render: (type: IdCardType) => renderIdCardTypeTag(type),
    },
    {
      title: '认证时间',
      dataIndex: 'verifyTime',
      key: 'verifyTime',
      width: 160,
      render: (time: string) => <Text style={{ fontSize: 12 }}>{formatDateTime(time)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AuditStatus) => renderAuditStatus(status),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' ? (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setAuditTarget(record);
                setAuditModalVisible(true);
              }}
            >
              审核
            </Button>
          ) : record.isManualReview ? (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setAuditTarget(record);
                setAuditModalVisible(true);
              }}
            >
              重审
            </Button>
          ) : null}

          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurrentRecord(record);
              setDrawerVisible(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部认证数据看板 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              borderLeft: '4px solid #1677ff',
            }}
            onClick={() => handleQuickFilterStatus('pending')}
          >
            <Statistic
              title={
                <Space>
                  <ClockCircleFilled style={{ color: '#1677ff' }} />
                  <span>待人工审核申请</span>
                </Space>
              }
              value={summaryStats.pendingCount}
              suffix="件"
              styles={{ content: { color: '#1677ff', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              borderLeft: '4px solid #52c41a',
            }}
            onClick={() => handleQuickFilterStatus('approved')}
          >
            <Statistic
              title={
                <Space>
                  <CheckCircleFilled style={{ color: '#52c41a' }} />
                  <span>已认证实名用户</span>
                </Space>
              }
              value={summaryStats.approvedCount}
              suffix="人"
              styles={{ content: { color: '#52c41a', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              borderLeft: '4px solid #ff4d4f',
            }}
            onClick={() => handleQuickFilterStatus('rejected')}
          >
            <Statistic
              title={
                <Space>
                  <CloseCircleFilled style={{ color: '#ff4d4f' }} />
                  <span>人工审核驳回</span>
                </Space>
              }
              value={summaryStats.rejectedCount}
              suffix="件"
              styles={{ content: { color: '#ff4d4f', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              borderLeft: '4px solid #722ed1',
            }}
            onClick={() => handleQuickFilterStatus('all')}
          >
            <Statistic
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#722ed1' }} />
                  <span>认证档案与单据总量</span>
                </Space>
              }
              value={summaryStats.totalCount}
              suffix="条"
              styles={{ content: { color: '#722ed1', fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索过滤表单 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{
            status: 'all',
            idCardType: 'all',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="姓名/昵称" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入真实姓名或昵称" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="申请/UID" name="uid" style={{ marginBottom: 0 }}>
                <Input placeholder="输入流水号或用户 UID" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="证件号码" name="idCardNo" style={{ marginBottom: 0 }}>
                <Input placeholder="输入证件号码" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="证件类型" name="idCardType" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部类型', value: 'all' },
                    { label: '居民身份证', value: 'id_card' },
                    { label: '护照', value: 'passport' },
                    { label: '港澳通行证', value: 'hk_mo_pass' },
                    { label: '台湾通行证', value: 'tw_pass' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="认证状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '待审核', value: 'pending' },
                    { label: '已通过 / 已认证', value: 'approved' },
                    { label: '已驳回', value: 'rejected' },
                    { label: '已撤销', value: 'revoked' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={12} md={10} lg={8}>
              <Form.Item label="认证时间" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={14} lg={16}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格卡片 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 600 }}>个人实名认证管理列表</span>
            <Tag color="cyan">共 {total} 条记录</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出个人认证数据
            </Button>
            <Tooltip title="刷新列表与统计">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchData(currentPage, pageSize);
                  fetchStats();
                }}
                loading={loading}
              />
            </Tooltip>
          </Space>
        }
      >
        <Table<PersonalVerificationItem>
          rowKey="id"
          columns={columns}
          dataSource={dataList}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (allTotal) => `共 ${allTotal} 条申请与认证记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchData(page, size);
            },
          }}
        />
      </Card>

      {/* 审核操作弹窗 */}
      <AuditModal
        open={auditModalVisible}
        type="personal"
        recordId={auditTarget?.id || null}
        targetName={auditTarget ? `${auditTarget.realName} (${auditTarget.nickname})` : ''}
        onSuccess={() => {
          setAuditModalVisible(false);
          fetchData(currentPage, pageSize);
          fetchStats();
        }}
        onCancel={() => setAuditModalVisible(false)}
      />

      {/* 详情抽屉 */}
      <Drawer
        title="个人实名认证档案详情"
        placement="right"
        size="large"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentRecord && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar src={currentRecord.avatar} size={64} icon={<UserOutlined />} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{currentRecord.realName}</span>
                  <Text type="secondary">({currentRecord.nickname})</Text>
                  {renderAuditStatus(currentRecord.status)}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">档案/申请编号: </Text>
                  <Text code copyable>
                    {currentRecord.id}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    用户UID: {currentRecord.userNo || currentRecord.uid}
                  </Text>
                </div>
              </div>
            </div>

            <Descriptions title="实名主体资质档案" bordered size="small" column={2}>
              <Descriptions.Item label="真实姓名">{currentRecord.realName}</Descriptions.Item>
              <Descriptions.Item label="证件类型">
                {renderIdCardTypeTag(currentRecord.idCardType)}
              </Descriptions.Item>
              <Descriptions.Item label="证件号码" span={2}>
                <Text code copyable>
                  {currentRecord.idCardNo}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="绑定电话">
                <Text
                  code
                  copyable={
                    currentRecord.phone || currentRecord.contactPhone
                      ? { text: currentRecord.phone || currentRecord.contactPhone }
                      : false
                  }
                >
                  {formatMaskedPhone(currentRecord.phone || currentRecord.contactPhone, false)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="认证渠道与来源">
                {currentRecord.isManualReview ? (
                  <Tag color="gold">人工待审异常工单</Tag>
                ) : (
                  <Tag color="green">三方自动核验通过</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="认证/申请时间">
                {formatDateTime(currentRecord.verifyTime)}
              </Descriptions.Item>
              <Descriptions.Item label="审核/通过时间">
                {formatDateTime(currentRecord.auditTime || currentRecord.verifyTime)}
              </Descriptions.Item>
              <Descriptions.Item label="审核人员" span={2}>
                {currentRecord.auditor || '系统自动处理'}
              </Descriptions.Item>
              <Descriptions.Item label="审核说明与备注" span={2}>
                {currentRecord.auditRemark || '三方核验一致，实名认证通过。'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '20px 0' }} />

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                证件材料与核验影像
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="证件人像面 / 正面">
                    <Image
                      src={
                        currentRecord.idCardFront ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
                      }
                      alt="证件正面"
                      style={{ borderRadius: 6, width: '100%', objectFit: 'cover' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="证件国徽面 / 反面">
                    <Image
                      src={
                        currentRecord.idCardBack ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
                      }
                      alt="证件反面"
                      style={{ borderRadius: 6, width: '100%', objectFit: 'cover' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PersonalVerification;
