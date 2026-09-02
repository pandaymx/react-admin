import { BankOutlined, UserOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
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
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" items={tabItems} />
    </div>
  );
};

export default VerificationPage;
