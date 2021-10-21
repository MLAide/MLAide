package com.mlaide.webserver.service.impl;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.KeyPair;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.repository.SshKeysRepository;
import com.mlaide.webserver.repository.UserRepository;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import com.mlaide.webserver.repository.entity.UserEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.UserResolver;
import com.mlaide.webserver.service.UserService;
import com.mlaide.webserver.service.mapper.SshKeyMapper;
import com.mlaide.webserver.service.mapper.UserMapper;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserResolver userResolver;
    private final SshKeysRepository sshKeyRepository;
    private final SshKeyMapper sshKeyMapper;
    private final Clock clock;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           UserResolver userResolver,
                           SshKeysRepository sshKeyRepository,
                           SshKeyMapper sshKeyMapper,
                           Clock clock) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userResolver = userResolver;
        this.sshKeyRepository = sshKeyRepository;
        this.sshKeyMapper = sshKeyMapper;
        this.clock = clock;
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
        user.setEmail(currentUserEntity.get().getEmail());
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

    @Override
    public ItemList<SshKey> getSshKeysForCurrentUser() {
        List<SshKeyEntity> sshKeyEntities = sshKeyRepository.findByUserId(getCurrentUserId());

        List<SshKey> sshKeys = sshKeyMapper.fromEntity(sshKeyEntities);

        return new ItemList<>(sshKeys);
    }

    @Override
    public SshKey createSshKeyForCurrentPrincipal(SshKey sshKey) {
        String userId = getCurrentUserId();

        logger.info("Creating new SSH key for user {}", userId);

        ByteArrayOutputStream privateKey = new ByteArrayOutputStream();
        ByteArrayOutputStream publicKey = new ByteArrayOutputStream();

        try {
            JSch jsch = new JSch();

            KeyPair keyPair = KeyPair.genKeyPair(jsch, KeyPair.RSA);
            keyPair.writePrivateKey(privateKey);
            keyPair.writePublicKey(publicKey, sshKey.getDescription());

            keyPair.dispose();
        } catch (JSchException e) {
            logger.error("Could not create SSH key", e);
            // TODO: Log that key generation failed and rethrow
        }

        SshKeyEntity sshKeyEntity = new SshKeyEntity();
        sshKeyEntity.setPrivateKey(privateKey.toByteArray());
        sshKeyEntity.setPublicKey(publicKey.toByteArray());
        sshKeyEntity.setCreatedAt(OffsetDateTime.now(clock));
        sshKeyEntity.setUserId(userId);
        sshKeyEntity.setDescription(sshKey.getDescription());

        SshKeyEntity savedSshKey = sshKeyRepository.insert(sshKeyEntity);

        return sshKeyMapper.fromEntity(savedSshKey);
    }

    @Override
    public void deleteSshKey(String sshKeyId) {
        ObjectId objectId = new ObjectId(sshKeyId);
        Optional<SshKeyEntity> sshKeyEntity = sshKeyRepository.findById(objectId);
        String userId = getCurrentUserId();

        if (sshKeyEntity.isEmpty() || !sshKeyEntity.get().getUserId().equalsIgnoreCase(userId)) {
            throw new NotFoundException();
        }

        sshKeyRepository.deleteById(objectId);
    }

    private User tryResolveUser(String userId) {
        User user = userResolver.getUser();
        if (user == null || !user.getUserId().equals(userId)) {
            throw new UsernameNotFoundException("Could not find the requested user");
        }

        UserEntity userEntity = userMapper.toEntity(user);
        userRepository.save(userEntity);

        logger.info("Created new user with user id '{}'", userEntity.getUserId());

        return user;
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
