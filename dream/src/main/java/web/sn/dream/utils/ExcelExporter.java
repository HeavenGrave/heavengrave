package web.sn.dream.utils;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import java.io.*;
import java.util.List;
import java.util.Map;

public class ExcelExporter {

    /**
     * 导出Excel文件
     * @param data 数据列表，每个元素是一个Map，代表一行数据
     * @param headers 表头名称数组
     * @param columnKeys 与表头对应的列键名数组
     * @param fileName 输出文件名
     * @param isXlsx 是否为xlsx格式（true为xlsx，false为xls）
     * @throws IOException
     */
    public static void exportExcel(List<Map<String, Object>> data,
                                   String[] headers,
                                   String[] columnKeys,
                                   String fileName,
                                   boolean isXlsx) throws IOException {
        // 创建工作簿
        Workbook workbook = isXlsx ? new XSSFWorkbook() : new HSSFWorkbook();

        // 创建工作表
        Sheet sheet = workbook.createSheet("数据表");

        // 创建表头样式
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 创建数据样式
        CellStyle dataStyle = createDataStyle(workbook);

        // 创建表头行
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 填充数据行
        int rowNum = 1;
        for (Map<String, Object> rowData : data) {
            Row row = sheet.createRow(rowNum++);
            for (int i = 0; i < columnKeys.length; i++) {
                Cell cell = row.createCell(i);
                Object value = rowData.get(columnKeys[i]);

                if (value != null) {
                    if (value instanceof String) {
                        cell.setCellValue((String) value);
                    } else if (value instanceof Integer) {
                        cell.setCellValue((Integer) value);
                    } else if (value instanceof Double) {
                        cell.setCellValue((Double) value);
                    } else if (value instanceof Boolean) {
                        cell.setCellValue((Boolean) value);
                    } else {
                        cell.setCellValue(value.toString());
                    }
                } else {
                    cell.setCellValue("");
                }

                cell.setCellStyle(dataStyle);
            }
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // 写入文件
        try (FileOutputStream fileOut = new FileOutputStream(fileName)) {
            workbook.write(fileOut);
        }

        workbook.close();
    }

    /**
     * 创建表头样式
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();

        // 设置表头样式
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);

        return style;
    }

    /**
     * 创建数据样式
     */
    private static CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        // 设置数据样式
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.LEFT);

        return style;
    }

    /**
     * 重载方法：导出Excel到输出流
     */
    public static void exportExcelToStream(List<Map<String, Object>> data,
                                           String[] headers,
                                           String[] columnKeys,
                                           OutputStream outputStream,
                                           boolean isXlsx) throws IOException {
        // 创建工作簿
        Workbook workbook = isXlsx ? new XSSFWorkbook() : new HSSFWorkbook();

        // 创建工作表
        Sheet sheet = workbook.createSheet("数据表");

        // 创建表头样式
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 创建数据样式
        CellStyle dataStyle = createDataStyle(workbook);

        // 创建表头行
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 填充数据行
        int rowNum = 1;
        for (Map<String, Object> rowData : data) {
            Row row = sheet.createRow(rowNum++);
            for (int i = 0; i < columnKeys.length; i++) {
                Cell cell = row.createCell(i);
                Object value = rowData.get(columnKeys[i]);

                if (value != null) {
                    if (value instanceof String) {
                        cell.setCellValue((String) value);
                    } else if (value instanceof Integer) {
                        cell.setCellValue((Integer) value);
                    } else if (value instanceof Double) {
                        cell.setCellValue((Double) value);
                    } else if (value instanceof Boolean) {
                        cell.setCellValue((Boolean) value);
                    } else {
                        cell.setCellValue(value.toString());
                    }
                } else {
                    cell.setCellValue("");
                }

                cell.setCellStyle(dataStyle);
            }
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // 写入输出流
        workbook.write(outputStream);
        workbook.close();
    }

    /**
     * 导出Excel并返回字节数组
     * @param data 数据列表，每个元素是一个Map，代表一行数据
     * @param headers 表头名称数组
     * @param columnKeys 与表头对应的列键名数组
     * @param isXlsx 是否为xlsx格式（true为xlsx，false为xls）
     * @return Excel文件的字节数组
     * @throws IOException
     */
    public static byte[] exportExcelToByteArray(List<Map<String, Object>> data,
                                                String[] headers,
                                                String[] columnKeys,
                                                boolean isXlsx) throws IOException {
        // 创建工作簿
        Workbook workbook = isXlsx ? new XSSFWorkbook() : new HSSFWorkbook();

        // 创建工作表
        Sheet sheet = workbook.createSheet("数据表");

        // 创建表头样式
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 创建数据样式
        CellStyle dataStyle = createDataStyle(workbook);

        // 创建表头行
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 填充数据行
        int rowNum = 1;
        for (Map<String, Object> rowData : data) {
            Row row = sheet.createRow(rowNum++);
            for (int i = 0; i < columnKeys.length; i++) {
                Cell cell = row.createCell(i);
                Object value = rowData.get(columnKeys[i]);

                if (value != null) {
                    if (value instanceof String) {
                        cell.setCellValue((String) value);
                    } else if (value instanceof Integer) {
                        cell.setCellValue((Integer) value);
                    } else if (value instanceof Double) {
                        cell.setCellValue((Double) value);
                    } else if (value instanceof Boolean) {
                        cell.setCellValue((Boolean) value);
                    } else {
                        cell.setCellValue(value.toString());
                    }
                } else {
                    cell.setCellValue("");
                }

                cell.setCellStyle(dataStyle);
            }
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // 将工作簿写入字节数组
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }


    /**
     * 示例使用方法
     */
    public static void main(String[] args) {
        try {
            // 示例数据
            List<Map<String, Object>> data = List.of(
                    Map.of("id", 1, "name", "张三", "age", 25, "email", "zhangsan@example.com"),
                    Map.of("id", 2, "name", "李四", "age", 30, "email", "lisi@example.com"),
                    Map.of("id", 3, "name", "王五", "age", 28, "email", "wangwu@example.com")
            );

            String[] headers = {"ID", "姓名", "年龄", "邮箱"};
            String[] columnKeys = {"id", "name", "age", "email"};

            // 导出Excel文件
            exportExcel(data, headers, columnKeys, "example.xlsx", true);

            System.out.println("Excel文件导出成功！");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
