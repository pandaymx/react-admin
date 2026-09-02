/**
 * 导出数据为 CSV / Excel 兼容文件
 * 包含 UTF-8 BOM，防止 Excel 打开中文时乱码
 */
export interface ExportColumn<T> {
  title: string;
  key: keyof T | string;
  render?: (record: T) => string | number;
}

export const exportToCsv = <T extends Record<string, any>>(
  columns: ExportColumn<T>[],
  data: T[],
  fileName = '导出数据',
) => {
  if (!data?.length) {
    throw new Error('没有可导出的数据');
  }

  // 构建表头
  const headers = columns.map((col) => `"${col.title.replace(/"/g, '""')}"`).join(',');

  // 构建数据行
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: any;
        if (col.render) {
          val = col.render(item);
        } else {
          val = item[col.key as keyof T];
        }

        if (val === undefined || val === null) {
          return '""';
        }

        // 转为字符串并转义双引号
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  const csvContent = `\uFEFF${[headers, ...rows].join('\r\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
