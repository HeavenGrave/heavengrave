package com.xs.novel.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

/**
 * 文件转换工具类
 */
public class FileUtil {

    public static File convertMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        // 创建临时文件
        File file = Files.createTempFile("temp", null).toFile();
        // 将 MultipartFile 写入临时文件
        try {
            multipartFile.transferTo(file.toPath());
        } catch (IOException e) {
            // 处理异常
            throw new IOException("Failed to convert MultipartFile to File", e);
        }

        return file;
    }
}
