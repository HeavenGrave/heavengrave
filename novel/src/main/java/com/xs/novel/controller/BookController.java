package com.xs.novel.controller;

;
import com.xs.novel.pojo.Book;
import com.xs.novel.pojo.Chapter;
import com.xs.novel.pojo.Result;
import com.xs.novel.service.BookService;
import com.xs.novel.service.ChapterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@RestController //标识当前类是一个请求处理类
@RequestMapping("book")
@Slf4j
public class BookController {
    @Autowired
    private BookService bookService;
    @Autowired
    private ChapterService chapterService;

//    @Autowired
//    private RedisTemplate redisTemplate;

    @GetMapping("/list")
    public Result list() {
        List<Book> books = bookService.findAll();
        return Result.success(books);
    }

    @PostMapping("/upload")
    public Result uploadBook(
            @RequestParam("name") String name,
            @RequestParam("author") String author,
            @RequestParam("des") String des,
            @RequestParam("file") MultipartFile file) {
        try {
            // 保存书籍基本信息
            Book book = new Book();
            book.setName(name);
            book.setAuthor(author);
            book.setDes(des);
//            book.setCoverUrl("/uploads/" + cover.getOriginalFilename()); // 假设封面图片存放在 /uploads 目录下
            bookService.saveBook(book);

            // 解析 .txt 文件内容并拆分章节
            List<Chapter> chapters = parseChapters(file, book);
            chapterService.saveAllChapter(chapters);
            book.setChapters(chapters.size());
            bookService.updateBook(book);
            return Result.success(book);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("服务器错误");
        }
    }

    /**
     * 自动拆分章节
     * @param file
     * @param book
     * @return
     * @throws Exception
     */
    /**
     * 解析上传文件并自动拆分小说章节
     * @param file 上传的文件对象
     * @param book 关联的书籍对象
     * @return 解析后的章节列表
     * @throws Exception 文件处理异常
     */
    public List<Chapter> parseChapters(MultipartFile file, Book book) throws Exception {
        List<Chapter> chapters = new ArrayList<>();
        // 增强版正则表达式，匹配多种章节格式：
        // 1. 支持中文数字和阿拉伯数字（第1章/第一百章）
        // 2. 支持多种分卷标识（章/卷/篇/集/部）
        // 3. 支持全角空格和特殊空白符（中文排版常见）
        Pattern pattern = Pattern.compile(
                "^第[\\d一二三四五六七八九十百千万]+[章卷篇集][\\s　]*(.*)$",
                Pattern.UNICODE_CHARACTER_CLASS
        );
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            Chapter currentChapter = null;
            StringBuilder contentBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {  // 逐行读取，内存友好
                Matcher matcher = pattern.matcher(line);
                if (matcher.find()) {
                    // 章节开始处理逻辑
                    if (currentChapter != null) {
                        // 结束前一章节：保存内容并重置缓存
                        currentChapter.setContent(contentBuilder.toString().trim());
                        chapters.add(currentChapter);
                        contentBuilder.setLength(0);
                    }
                    // 创建新章节对象
                    currentChapter = new Chapter();
                    // 自动递增章节编号（从0开始）
                    currentChapter.setChapterNum(chapters.size());
                    // 提取章节名称（排除"第X章"前缀）
                    currentChapter.setName(matcher.group(1).trim());
                    // 将章节标题行包含在内容中
                    contentBuilder.append(line).append("\n");
                    currentChapter.setBookId(book.getId());
                } else {
                    // 普通内容行处理
                    if (currentChapter != null) {
                        contentBuilder.append(line).append("\n");
                    }
                    // 忽略章节开始前的内容（如序言）
                }
            }
            // 处理最后一个章节
            if (currentChapter != null) {
                currentChapter.setContent(contentBuilder.toString().trim());
                chapters.add(currentChapter);
            }
        } catch (IOException e) {
            throw new RuntimeException("章节解析失败，文件读取异常", e);
        }
        return chapters;
    }
}
