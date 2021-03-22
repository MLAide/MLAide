package com.mlaide.webserver.service;

import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.model.User;

public interface UserService {
    User getUser(String userId);

    User getCurrentUser();

    UserRef getCurrentUserRef();

    void updateCurrentUser(User user);

    User getUserByEmail(String email);
}
