import { BankOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Tabs } from 'antd';
import type React from 'react';
import { useState } from 'react';

import EnterpriseVerification from './components/EnterpriseVerification';
import PersonalVerification from './components/PersonalVerification';

export const VerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('personal');

  const tabItems = [
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined style={{ marginRight: 6 }} />
          个人实名认证
        </span>
      ),
      children: <PersonalVerification />,
    },
    {
      key: 'enterprise',
      label: (
        <span>
          <BankOutlined style={{ marginRight: 6 }} />
          企业蓝V认证
        </span>
      ),
      children: <EnterpriseVerification />,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#e6f4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1677ff',
              fontSize: 20,
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1f1f1f' }}>
              身份资质与认证审核管理
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
              统一管理全平台创作者个人实名核验与企业机构主体资质审核流转
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
        style={{
          background: 'transparent',
        }}
      />
    </div>
  );
};

export default VerificationPage;
