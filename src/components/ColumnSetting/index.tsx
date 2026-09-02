import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover, Space, Tag, Tooltip, Typography, theme } from 'antd';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';

const { Text } = Typography;

export interface ColumnOptionItem {
  key: string;
  title: string;
  required?: boolean; // 必选列，禁止隐藏
  defaultVisible?: boolean; // 默认是否可见
}

interface ColumnSettingProps {
  options: ColumnOptionItem[];
  checkedKeys: string[];
  onChange: (keys: string[]) => void;
  onReset: () => void;
}

export const ColumnSetting: React.FC<ColumnSettingProps> = ({
  options,
  checkedKeys,
  onChange,
  onReset,
}) => {
  const { token } = theme.useToken();

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (checked) {
      onChange([...checkedKeys, key]);
    } else {
      onChange(checkedKeys.filter((k) => k !== key));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onChange(options.map((opt) => opt.key));
    } else {
      // 仅保留必选项
      onChange(options.filter((opt) => opt.required).map((opt) => opt.key));
    }
  };

  const isAllChecked = options.every((opt) => checkedKeys.includes(opt.key));
  const isIndeterminate = checkedKeys.length > 0 && checkedKeys.length < options.length;

  const content = (
    <div style={{ width: 220, maxHeight: 380, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Checkbox
          indeterminate={isIndeterminate}
          checked={isAllChecked}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          <Text strong style={{ fontSize: 13 }}>
            全选所有列
          </Text>
        </Checkbox>
        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReset}
          style={{ padding: 0, fontSize: 12 }}
        >
          重置
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {options.map((opt) => {
          const isChecked = checkedKeys.includes(opt.key);
          return (
            <div
              key={opt.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '3px 4px',
                borderRadius: 4,
              }}
            >
              <Checkbox
                checked={isChecked || opt.required}
                disabled={opt.required}
                onChange={(e) => handleCheckboxChange(opt.key, e.target.checked)}
              >
                <Text style={{ fontSize: 13 }}>{opt.title}</Text>
              </Checkbox>
              {opt.required && (
                <Tooltip title="核心基准列，禁止隐藏">
                  <Tag color="blue" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                    必选
                  </Tag>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={6}>
            <SettingOutlined style={{ color: '#1677ff' }} />
            <span>自定义表格列显示</span>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            已选 {checkedKeys.length}/{options.length}
          </Text>
        </div>
      }
      trigger="click"
      placement="bottomRight"
    >
      <Tooltip title="自定义表格列显示与隐藏">
        <Button icon={<SettingOutlined />}>列设置</Button>
      </Tooltip>
    </Popover>
  );
};

/**
 * 列配置状态管理 Hook
 */
export function useColumnSettings(storageKey: string, options: ColumnOptionItem[]) {
  const defaultKeys = useMemo(
    () =>
      options.filter((opt) => opt.defaultVisible !== false || opt.required).map((opt) => opt.key),
    [options],
  );

  const [checkedKeys, setCheckedKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`react_admin_cols_${storageKey}`);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        // 保证所有 required 的列一定在 checkedKeys 中
        const requiredKeys = options.filter((o) => o.required).map((o) => o.key);
        return Array.from(new Set([...parsed, ...requiredKeys]));
      }
    } catch {
      // ignore
    }
    return defaultKeys;
  });

  const updateCheckedKeys = useCallback(
    (keys: string[]) => {
      // 强制包含必选列
      const requiredKeys = options.filter((o) => o.required).map((o) => o.key);
      const finalKeys = Array.from(new Set([...keys, ...requiredKeys]));
      setCheckedKeys(finalKeys);
      try {
        localStorage.setItem(`react_admin_cols_${storageKey}`, JSON.stringify(finalKeys));
      } catch {
        // ignore
      }
    },
    [storageKey, options],
  );

  const resetKeys = useCallback(() => {
    setCheckedKeys(defaultKeys);
    try {
      localStorage.removeItem(`react_admin_cols_${storageKey}`);
    } catch {
      // ignore
    }
  }, [defaultKeys, storageKey]);

  return {
    checkedKeys,
    setCheckedKeys: updateCheckedKeys,
    resetKeys,
    ColumnSettingComponent: (
      <ColumnSetting
        options={options}
        checkedKeys={checkedKeys}
        onChange={updateCheckedKeys}
        onReset={resetKeys}
      />
    ),
  };
}

export default ColumnSetting;
