package com.xs.novel.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@Slf4j
public class RedisConfiguratio {
   @Bean
   public RedisTemplate redisTemplate(RedisConnectionFactory redisConnectionFactory) {
       log.info("开始创建redis模板类...");
       RedisTemplate redisTemplate = new RedisTemplate();
       //设置Key的序列化器，默认为JdkSeriaLizationRedisSeriaLizer
       redisTemplate.setKeySerializer(new StringRedisSerializer());
       redisTemplate.setConnectionFactory(redisConnectionFactory);
       return redisTemplate;
   }
}
