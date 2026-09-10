import {
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Empty,
  Input,
  message,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadOpsLogFile, getOpsLogContent } from '@/api/ops';
import { useThemeStore } from '@/store/theme';
import type { OpsLogEntry, OpsLogFileItem } from '@/types';

const { Text } = Typography;

interface LogViewerDrawerProps {
  open: boolean;
  file: OpsLogFileItem | null;
  onClose: () => void;
}

export const LogViewerDrawer: React.FC<LogViewerDrawerProps> = ({ open, file, onClose }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const { token } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [lines, setLines] = useState<number>(100);
  const [entries, setEntries] = useState<OpsLogEntry[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const terminalRef = useRef<HTMLDivElement>(null);

  const fetchContent = useCallback(async () => {
    if (!file) return;
    try {
      setLoading(true);
      const res = await getOpsLogContent(file.id, lines);
      if (res.code === 200 && res.data) {
        setEntries(res.data.entries);
        setRawText(res.data.rawText);
      }
    } catch {
      message.error('加载日志内容失败');
    } finally {
      setLoading(false);
    }
  }, [file, lines]);

  useEffect(() => {
    if (open && file) {
      fetchContent();
    }
  }, [open, file, fetchContent]);

  const handleScrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  const handleCopy = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    message.success('已复制当前视窗日志内容到剪贴板');
  };

  const handleDownload = () => {
    if (!file) return;
    downloadOpsLogFile(file);
    message.success(`已开始下载日志文件: ${file.fileName}`);
  };

  const filteredEntries = keyword
    ? entries.filter(
        (e) =>
          e.message.toLowerCase().includes(keyword.toLowerCase()) ||
          e.level.toLowerCase().includes(keyword.toLowerCase()) ||
          e.logger.toLowerCase().includes(keyword.toLowerCase()) ||
          e.traceId?.toLowerCase().includes(keyword.toLowerCase()),
      )
    : entries;

  if (!file) return null;

  return (
    <Drawer
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingRight: 24,
          }}
        >
          <Space size="middle">
            <FileTextOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{file.fileName}</span>
                <Tag
                  color={
                    file.level === 'ERROR' ? 'error' : file.level === 'WARN' ? 'warning' : 'blue'
                  }
                >
                  {file.level}
                </Tag>
                {file.compressed && <Tag color="purple">GZIP</Tag>}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {file.serviceName} ({file.serviceCode}) | 大小: {file.sizeHuman} | 路径:{' '}
                <code>{file.filePath}</code>
              </Text>
            </div>
          </Space>
        </div>
      }
      open={open}
      onClose={onClose}
      width={1000}
      extra={
        <Space>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载此日志
          </Button>
        </Space>
      }
      styles={{
        body: {
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDark ? '#141414' : '#f5f5f5',
        },
      }}
    >
      {/* 顶部工具过滤栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '10px 14px',
          borderRadius: 8,
          background: isDark ? '#1f1f1f' : '#ffffff',
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Space size="middle">
          <Input
            placeholder="在当前视窗检索关键词 (如 ERROR, SQL, traceId)..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 320 }}
            size="small"
          />
          <Space size="small">
            <Text type="secondary" style={{ fontSize: 13 }}>
              展示行数:
            </Text>
            <Select
              value={lines}
              onChange={setLines}
              size="small"
              style={{ width: 110 }}
              options={[
                { label: '最新 50 行', value: 50 },
                { label: '最新 100 行', value: 100 },
                { label: '最新 200 行', value: 200 },
                { label: '最新 500 行', value: 500 },
              ]}
            />
          </Space>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            size="small"
            onClick={fetchContent}
            loading={loading}
          >
            刷新
          </Button>
        </Space>

        <Space>
          <Button icon={<CopyOutlined />} size="small" onClick={handleCopy}>
            复制日志
          </Button>
          <Button
            icon={<VerticalAlignBottomOutlined />}
            size="small"
            onClick={handleScrollToBottom}
          >
            滚至底部
          </Button>
        </Space>
      </div>

      {/* 终端控制台黑底视图 */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#121314',
          color: '#e6edf3',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #30363d',
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          fontSize: 12.5,
          lineHeight: 1.6,
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        {loading && entries.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Spin tip="正在读取远程日志文件流..." />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Empty description={<span style={{ color: '#8c8c8c' }}>未找到匹配的日志内容</span>} />
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            let levelColor = '#3fb950'; // INFO: green
            if (entry.level === 'WARN') levelColor = '#d29922'; // WARN: yellow
            if (entry.level === 'ERROR') levelColor = '#f85149'; // ERROR: red
            if (entry.level === 'DEBUG') levelColor = '#8b949e'; // DEBUG: gray

            return (
              <div
                key={entry.id || index}
                style={{
                  marginBottom: 6,
                  padding: '2px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                <span style={{ color: '#7d8590', marginRight: 8 }}>{entry.timestamp}</span>
                <span
                  style={{
                    color: levelColor,
                    fontWeight: 'bold',
                    marginRight: 8,
                    display: 'inline-block',
                    width: 50,
                  }}
                >
                  [{entry.level}]
                </span>
                <span style={{ color: '#58a6ff', marginRight: 8 }}>{entry.thread}</span>
                {entry.traceId && (
                  <span style={{ color: '#bc8cff', marginRight: 8 }}>[{entry.traceId}]</span>
                )}
                <span style={{ color: '#d2a8ff', marginRight: 8 }}>{entry.logger}</span>
                <span style={{ color: '#e6edf3' }}>: {entry.message}</span>
                {entry.stackTrace && (
                  <pre
                    style={{
                      margin: '6px 0 0 24px',
                      color: '#ff7b72',
                      fontSize: 12,
                      background: 'rgba(255, 123, 114, 0.08)',
                      padding: '8px 12px',
                      borderRadius: 4,
                      borderLeft: '3px solid #f85149',
                    }}
                  >
                    {entry.stackTrace}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          显示行数: {filteredEntries.length} 条 / 检索结果 (共 {entries.length} 条已加载)
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          快捷提示：日志已做脱敏处理，支持批量或单项导出
        </Text>
      </div>
    </Drawer>
  );
};
export default LogViewerDrawer;
