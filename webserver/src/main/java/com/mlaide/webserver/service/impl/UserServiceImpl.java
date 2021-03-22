package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.repository.UserRepository;
import com.mlaide.webserver.repository.entity.UserEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.service.mapper.UserMapper;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.UserResolver;
import com.mlaide.webserver.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final Logger LOGGER = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserResolver userResolver;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           UserResolver userResolver) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userResolver = userResolver;
    }

    @Override
    public User getUser(String userId) {
        Optional<UserEntity> user = userRepository.findByUserId(userId);

        if (user.isPresent()) {
            return userMapper.fromEntity(user.get());
        } else {
            return tryResolveUser(userId);
        }
    }

    @Override
    public User getCurrentUser() {
        String userId = getCurrentUserId();
        return getUser(userId);
    }

    @Override
    public UserRef getCurrentUserRef() {
        User currentUser = getCurrentUser();

        UserRef userRef = new UserRef();
        userRef.setUserId(currentUser.getUserId());
        userRef.setNickName(currentUser.getNickName());

        return userRef;
    }

    @Override
    public void updateCurrentUser(User user) {
        String currentUserId = getCurrentUserId();

        Optional<UserEntity> currentUserEntity = userRepository.findByUserId(currentUserId);
        if (currentUserEntity.isEmpty()) {
            throw new NotFoundException();
        }

        UserEntity userEntity = userMapper.toEntity(user);

        userEntity.setId(currentUserEntity.get().getId());
        userEntity.setUserId(currentUserEntity.get().getUserId());

        userRepository.save(userEntity);
    }

    @Override
    public User getUserByEmail(String email) {
        Optional<UserEntity> userEntity = userRepository.findByEmail(email);
        if (userEntity.isEmpty()) {
            throw new NotFoundException();
        }

        return userMapper.fromEntity(userEntity.get());
    }

    private User tryResolveUser(String userId) {
        User user = userResolver.getUser();
        if (user == null || !user.getUserId().equals(userId)) {
            throw new UsernameNotFoundException("Could not find the requested user");
        }

        UserEntity userEntity = userMapper.toEntity(user);
        userRepository.save(userEntity);

        LOGGER.info("Created new user with user id '" + userEntity.getUserId() + "'");

        return user;
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
