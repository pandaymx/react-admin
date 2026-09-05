import {
  BankOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  DownloadOutlined,
  MinusCircleFilled,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
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

import { getEnterpriseVerificationList, getVerificationSummaryStats } from '@/api/verification';
import type {
  AuditStatus,
  EnterpriseVerificationItem,
  VerificationQueryParams,
  VerificationSummaryStats,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatDateTime } from '@/utils/time';
import { AuditModal } from './AuditModal';

const { Text } = Typography;

export const EnterpriseVerification: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<EnterpriseVerificationItem[]>([]);
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

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<EnterpriseVerificationItem | null>(null);

  const [auditModalVisible, setAuditModalVisible] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<EnterpriseVerificationItem | null>(null);

  // 拉取统计概览
  const fetchStats = useCallback(async () => {
    try {
      const res = await getVerificationSummaryStats('enterprise');
      if (res.code === 200 && res.data) {
        setSummaryStats(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

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
          status: values.status,
          page,
          pageNo: page,
          pageSize: size,
        };

        const res = await getEnterpriseVerificationList(params);
        if (res.code === 200) {
          setDataList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取企业认证列表失败');
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

  const handleQuickFilterStatus = (status: AuditStatus | 'all') => {
    form.setFieldsValue({ status });
    fetchData(1, pageSize);
  };

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

  const handleExport = () => {
    setExportLoading(true);
    try {
      if (!dataList.length) {
        message.warning('当前列表无数据可导出');
        return;
      }
      exportToCsv(
        [
          { title: '企业认证编号', key: 'id' },
          { title: '申请人UID', key: 'uid' },
          { title: '申请人昵称', key: 'nickname' },
          { title: '企业全称', key: 'companyName' },
          { title: '统一社会信用代码', key: 'creditCode' },
          { title: '法定代表人', key: 'legalPerson' },
          { title: '所属行业', key: 'industry' },
          {
            title: '认证状态',
            key: 'status',
            render: (r) =>
              r.status === 'approved' ? '已通过' : r.status === 'rejected' ? '已驳回' : '待审核',
          },
          {
            title: '认证渠道/来源',
            key: 'source',
            render: (r) => (r.isManualReview ? '人工待审工单' : '企业四要素核验'),
          },
          { title: '申请时间', key: 'verifyTime' },
          { title: '审核备注', key: 'auditRemark' },
        ],
        dataList,
        '企业蓝V认证管理列表',
      );
      message.success(`成功导出 ${dataList.length} 条企业认证记录`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const columns: TableProps<EnterpriseVerificationItem>['columns'] = [
    {
      title: '编号与标识',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id: string, record) => (
        <div>
          <Text code copyable={{ tooltips: ['复制申请编号', '已复制'] }} style={{ fontSize: 12 }}>
            {id}
          </Text>
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
              <Tag color="blue" style={{ fontSize: 10, lineHeight: '18px', padding: '0 4px' }}>
                已认证企业
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '申请账号',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 160,
      render: (nickname: string, record) => (
        <Space size={8}>
          <Avatar src={record.avatar} size={38} icon={<BankOutlined />} />
          <Text strong style={{ fontSize: 13 }}>
            {nickname}
          </Text>
        </Space>
      ),
    },
    {
      title: '企业全称与行业',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 240,
      render: (name: string, record) => (
        <div>
          <Text strong style={{ color: '#0958d9' }}>
            {name}
          </Text>
          <div style={{ marginTop: 2 }}>
            <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
              {record.industry || '官方认证企业'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '统一信用代码',
      dataIndex: 'creditCode',
      key: 'creditCode',
      width: 200,
      render: (code: string) => (
        <Text code copyable style={{ fontSize: 12 }}>
          {code}
        </Text>
      ),
    },
    {
      title: '法定代表人',
      dataIndex: 'legalPerson',
      key: 'legalPerson',
      width: 120,
      render: (person: string) => <Text>{person}</Text>,
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
      {/* 顶部企业认证看板 */}
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
                  <span>待人工审核企业申请</span>
                </Space>
              }
              value={summaryStats.pendingCount}
              suffix="家"
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
                  <span>已认证企业蓝V机构</span>
                </Space>
              }
              value={summaryStats.approvedCount}
              suffix="家"
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
              suffix="家"
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
              borderLeft: '4px solid #1677ff',
            }}
            onClick={() => handleQuickFilterStatus('all')}
          >
            <Statistic
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
                  <span>企业认证档案总量</span>
                </Space>
              }
              value={summaryStats.totalCount}
              suffix="家"
              styles={{ content: { color: '#1677ff', fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

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
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="企业/法人" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入企业全称、法人或昵称" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="申请/UID" name="uid" style={{ marginBottom: 0 }}>
                <Input placeholder="输入流水号或用户 UID" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="认证状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '待审核', value: 'pending' },
                    { label: '已通过 / 已认证', value: 'approved' },
                    { label: '已驳回', value: 'rejected' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
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

      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 600 }}>企业蓝V认证管理列表</span>
            <Tag color="blue">共 {total} 家企业</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出企业认证数据
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
        <Table<EnterpriseVerificationItem>
          rowKey="id"
          columns={columns}
          dataSource={dataList}
          loading={loading}
          scroll={{ x: 1150 }}
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

      <AuditModal
        open={auditModalVisible}
        type="enterprise"
        recordId={auditTarget?.id || null}
        targetName={auditTarget?.companyName || ''}
        onSuccess={() => {
          setAuditModalVisible(false);
          fetchData(currentPage, pageSize);
          fetchStats();
        }}
        onCancel={() => setAuditModalVisible(false)}
      />

      <Drawer
        title="企业认证申报与主体资质详情"
        placement="right"
        size="large"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentRecord && (
          <div>
            <Descriptions title="企业主体资质" bordered size="small" column={2}>
              <Descriptions.Item label="企业全称" span={2}>
                <Text strong>{currentRecord.companyName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="统一信用代码" span={2}>
                <Text code copyable>
                  {currentRecord.creditCode}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="法定代表人">{currentRecord.legalPerson}</Descriptions.Item>
              <Descriptions.Item label="所属行业领域">
                {currentRecord.industry || '综合企业'}
              </Descriptions.Item>
              <Descriptions.Item label="申请人UID">
                {currentRecord.userNo || currentRecord.uid}
              </Descriptions.Item>
              <Descriptions.Item label="申请人昵称">{currentRecord.nickname}</Descriptions.Item>
              <Descriptions.Item label="认证状态">
                {renderAuditStatus(currentRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="认证渠道与来源">
                {currentRecord.isManualReview ? (
                  <Tag color="gold">人工待审异常工单</Tag>
                ) : (
                  <Tag color="green">四要素官方自动核验</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="申请/认证时间">
                {formatDateTime(currentRecord.verifyTime)}
              </Descriptions.Item>
              <Descriptions.Item label="审核时间">
                {formatDateTime(currentRecord.auditTime || currentRecord.verifyTime)}
              </Descriptions.Item>
              <Descriptions.Item label="审核人员" span={2}>
                {currentRecord.auditor || '企业认证系统'}
              </Descriptions.Item>
              <Descriptions.Item label="审核说明" span={2}>
                {currentRecord.auditRemark || '企业资质与信用信息四要素核验通过。'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                营业执照与认证证件影像
              </div>
              <Card size="small">
                <Image
                  src={
                    currentRecord.licenseUrl ||
                    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
                  }
                  alt="企业营业执照"
                  style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 6 }}
                />
              </Card>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EnterpriseVerification;
