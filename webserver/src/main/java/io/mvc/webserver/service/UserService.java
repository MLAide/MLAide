package io.mvc.webserver.service;

import io.mvc.webserver.model.User;
import io.mvc.webserver.repository.entity.UserRef;

public interface UserService {
    User getUser(String userId);

    User getCurrentUser();

    UserRef getCurrentUserRef();

    void updateCurrentUser(User user);

    User getUserByEmail(String email);
}
