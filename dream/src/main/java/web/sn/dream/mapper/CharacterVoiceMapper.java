package web.sn.dream.mapper;

import org.apache.ibatis.annotations.Mapper;
import web.sn.dream.pojo.CharacterVoice;

import java.util.List;

@Mapper
public interface CharacterVoiceMapper {
    Integer insertCharacterVoice(CharacterVoice characterVoice);

    void  updateCharacterVoice(CharacterVoice characterVoice);

    CharacterVoice  findCharacterVoiceById(int id);

    void deleteCharacterVoiceById(int id);

    List<CharacterVoice> findAllCharacterVoice();

    void deleteAllData();

    List<CharacterVoice> findCharacterVoiceByCond(String book, String actor, String gender);

    List<CharacterVoice> findVoiceInfoByCondToPage(String novelName, String gender, String actor, String emotion, int startNum, int pageSize);

    int findVoiceInfoByCondCount(String novelName, String gender, String actor, String emotion);
}
