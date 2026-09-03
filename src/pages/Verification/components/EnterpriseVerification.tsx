import {
  BankOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  DownloadOutlined,
  MinusCircleFilled,
  ReloadOutlined,
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
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { getEnterpriseVerificationList } from '@/api/verification';
import type { AuditStatus, EnterpriseVerificationItem, VerificationQueryParams } from '@/types';
import { exportToCsv } from '@/utils/export';
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

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<EnterpriseVerificationItem | null>(null);

  const [auditModalVisible, setAuditModalVisible] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<EnterpriseVerificationItem | null>(null);

  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: VerificationQueryParams = {
          keyword: values.keyword,
          uid: values.uid,
          status: values.status,
          page,
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
  }, [fetchData]);

  const handleSearch = () => {
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id: string, record) => (
        <div>
          <Text code copyable={{ tooltips: ['复制申请编号', '已复制'] }} style={{ fontSize: 12 }}>
            {id}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.uid}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 160,
      render: (nickname: string, record) => (
        <Space size={8}>
          <Avatar src={record.avatar} size={36} icon={<BankOutlined />} />
          <Text strong style={{ fontSize: 13 }}>
            {nickname}
          </Text>
        </Space>
      ),
    },
    {
      title: '企业名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 230,
      render: (name: string, record) => (
        <div>
          <Text strong style={{ color: '#0958d9' }}>
            {name}
          </Text>
          <div>
            <Tag color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
              {record.industry || '综合企业'}
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
      render: (time: string) => <Text style={{ fontSize: 12 }}>{time}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: AuditStatus) => renderAuditStatus(status),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
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
          ) : (
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
          )}

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
                    { label: '已通过', value: 'approved' },
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
            <span style={{ fontSize: 16, fontWeight: 600 }}>企业蓝V认证申请列表</span>
            <Tag color="blue">共 {total} 家企业</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出企业认证数据
            </Button>
            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} />
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
            showTotal: (allTotal) => `共 ${allTotal} 条申请记录`,
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
          fetchData();
        }}
        onCancel={() => setAuditModalVisible(false)}
      />

      <Drawer
        title="企业认证申报详情"
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
              <Descriptions.Item label="行业领域">
                {currentRecord.industry || '未归类'}
              </Descriptions.Item>
              <Descriptions.Item label="申请人UID">{currentRecord.uid}</Descriptions.Item>
              <Descriptions.Item label="申请人昵称">{currentRecord.nickname}</Descriptions.Item>
              <Descriptions.Item label="认证状态">
                {renderAuditStatus(currentRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">{currentRecord.verifyTime}</Descriptions.Item>
              <Descriptions.Item label="审核人">{currentRecord.auditor || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核时间">
                {currentRecord.auditTime || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核说明" span={2}>
                {currentRecord.auditRemark || '无'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                营业执照证件照片
              </div>
              <Card size="small">
                <Image
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80"
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
