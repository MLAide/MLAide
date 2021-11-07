package com.mlaide.webserver.service;

import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.model.User;

import java.security.KeyPair;
import java.util.List;

public interface UserService {
    User getUser(String userId);

    User getCurrentUser();

    UserRef getCurrentUserRef();

    void updateCurrentUser(User user);

    User getUserByEmail(String email);

    ItemList<SshKey> getSshKeysForCurrentUser();

    List<KeyPair> getSshKeyPairsForCurrentUser();

    SshKey createSshKeyForCurrentPrincipal(SshKey sshKey);

    void deleteSshKey(String sshKeyId);
}
