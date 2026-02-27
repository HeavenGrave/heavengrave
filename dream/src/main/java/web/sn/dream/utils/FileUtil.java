package web.sn.dream.utils;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 文件转换工具类
 */
@Component
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

    /**
     * 文本转音频
     * @param content
     * @param actor
     * @param speechRate
     * @param tone
     * @param emotion
     * @param chapterNum
     * @param index
     * @return
     */
    public static String TEXT_TO_AUDIO(String content,String actor,int speechRate,String tone,String emotion,int chapterNum,int index) {
        String filePath ="";
        OkHttpClient client = new OkHttpClient();
        // 请求体 JSON
        String json = "{" +
                "\"input\": \""+content+"\"," +
                "\"voice\": \""+actor+"\"," +
                "\"speed\": "+speechRate+"," +
                "\"pitch\": \""+tone+"\"," +
                "\"style\": \""+emotion+"\"" +
                "}";

        okhttp3.RequestBody body = okhttp3.RequestBody.create(
                okhttp3.MediaType.parse("application/json; charset=utf-8"), json
        );
        Request request = new Request.Builder()
                .url("https://tts.wangwangit.com/v1/audio/speech")
                .post(body)
                .build();
        String savePath ="";
        try (
                Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("请求失败: " + response);
            }
//            File novelDir = new File("/www/audio" );
//            // 3. 判断文件夹是否存在，不存在则创建（包括父目录）
//            if (!novelDir.exists()) {
//                boolean createSuccess = novelDir.mkdirs(); // mkdirs() 支持创建多级目录
//                if (!createSuccess) {
//                    throw new IOException("创建小说文件夹失败：" + novelDir.getAbsolutePath());
//                }
//            }

            savePath = "/www/audio/"+chapterNum+"_"+index+".mp3";
            // 保存响应到 MP3 文件
            try (InputStream is = response.body().byteStream();
                 OutputStream os = new FileOutputStream(savePath)) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                System.out.println("文件已保存为 "+chapterNum+"_"+index+".mp3");
                filePath="http://8.141.4.23:888/audio/"+chapterNum+"_"+index+".mp3";
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return filePath;
    }


}
