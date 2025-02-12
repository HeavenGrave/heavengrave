package web.sn.dream;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import web.sn.dream.mapper.UserMapper;
import web.sn.dream.pojo.User;
import web.sn.dream.service.impl.UserServiceImpl;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class UserServiceImplTest {

//    @Mock
//    private UserMapper userMapper;
//
//    @InjectMocks
//    private UserServiceImpl userService;
//
//    @BeforeEach
//    public void setUp() {
//        MockitoAnnotations.initMocks(this);
//    }
//
//    @Test
//    public void registerUser_UserExists_LogsError() {
//        User existingUser = new User();
//        existingUser.setName("existingUser");
//        when(userMapper.findUserByName("existingUser")).thenReturn(existingUser);
//        User newUser = new User();
//        newUser.setName("existingUser");
//        newUser.setPassword("password");
//
//        userService.registerUser(newUser);
//
//        verify(userMapper, never()).insertUser(any(User.class));
//    }
//
//    @Test
//    public void registerUser_UserDoesNotExist_RegistersUser() {
//        when(userMapper.findUserByName("newUser")).thenReturn(null);
//        when(userMapper.insertUser(any(User.class))).thenReturn(1);
//
//        User newUser = new User();
//        newUser.setName("newUser");
//        newUser.setPassword("password");
//
//        userService.registerUser(newUser);
//
//        verify(userMapper, times(1)).insertUser(any(User.class));
//    }
//
//    @Test
//    public void registerUser_UserInsertFails_LogsError() {
//        when(userMapper.findUserByName("newUser")).thenReturn(null);
//        when(userMapper.insertUser(any(User.class))).thenReturn(0);
//
//        User newUser = new User();
//        newUser.setName("newUser");
//        newUser.setPassword("password");
//
//        userService.registerUser(newUser);
//
//        verify(userMapper, times(1)).insertUser(any(User.class));
//    }
}
