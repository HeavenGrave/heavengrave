package web.sn.dream.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import web.sn.dream.mapper.UserMapper;
import web.sn.dream.pojo.Result;
import web.sn.dream.utils.FileUtil;
import org.springframework.web.reactive.function.client.WebClient;


import java.io.File;
import java.io.IOException;


@RestController
@RequestMapping("img")
public class ImageController {

    @Autowired
    private UserMapper userMapper;
    private static String apiUrl = "https://sm.ms/api/v2/upload";
    private static  String apiKey = "r6SsXcCENyp1B5DfxqPoh2FivlIwdZYH";

//    @PostMapping("/upload")
//    public Result handleImageUpload(@RequestParam("file") MultipartFile file) {
//        ImageInfo imageInfo =new ImageInfo();
//        // 调用文件上传服务类来处理上传请求
//        try {
//            // 获取"static"目录的绝对路径
//            Resource resource = new ClassPathResource("static");
//            //
//            String staticDirectory = resource.getFile().getAbsolutePath();
//            // 获取文件名
//            String fileName = file.getOriginalFilename();
//            String path= staticDirectory +"\\image\\img\\"+ fileName;
//
//            System.out.println("图片储存路径："+path);
//            // 创建目标文件
//            File dest = new File(path);
//
//            // 将上传文件保存到目标文件
//            file.transferTo(dest);
//
//            HashMap<String,Object> data =new HashMap<>();
//            data.put("url","image/img/"+fileName);
//            data.put("alt",fileName);
//            data.put("href","image/img/"+fileName);
//            imageInfo.setCode(0);
//            imageInfo.setData(data);
//            // 返回文件的访问路径，可以根据实际情况拼接成完整的 URL
//            return Result.success(imageInfo);
//        } catch (IOException e) {
//            e.printStackTrace();
////            imageInfo.setCode(1);
////            imageInfo.setMessage("上传失败！");
//            return Result.error("上传失败！");
//        }
//    }


    @PostMapping("/addImage")
    public Result addImage(@RequestParam("file") MultipartFile file) throws IOException {
        String resultString = "";
        File imageFile = FileUtil.convertMultipartFileToFile(file);
        resultString =uploadImage(apiUrl,apiKey,imageFile);
        System.out.println(resultString);
        // 返回文件的访问路径，可以根据实际情况拼接成完整的 URL
        return Result.success(resultString);
    }

//    /**
//     * 用户更新头像
//     * @param file
//     * @return
//     */
//    @RequestMapping("/update")
//    private JsonResult<String> updateUserImage(@RequestParam("file") MultipartFile file) throws IOException {
//        String resultString = "";
//        File imageFile = FileUtil.convertMultipartFileToFile(file);
//        resultString =uploadImage(apiUrl,apiKey,imageFile);
//        return new JsonResult<>(OK, resultString);
//    }

    /**
     * sm图床上传图片
     * @param apiUrl
     * @param apiKey
     * @param file
     * @return
     */
    public String uploadImage(String apiUrl, String apiKey, File file) {
        // 创建 WebClient
        WebClient webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.MULTIPART_FORM_DATA_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, apiKey)
                .build();
        // 构建请求体，包含图片文件
        FileSystemResource fileSystemResource = new FileSystemResource(file);
        // 构建请求参数
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("smfile", fileSystemResource);
        // 发送 POST 请求
        return webClient.post()
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .exchange()
                .flatMap(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(String.class);
                    } else {
                        return response.bodyToMono(String.class).doOnNext(bodyResponse -> {
                            System.out.println("图片上传结果: " + bodyResponse);
                        });
                    }
                }).block(); // 阻塞直到请求完成
    }
}