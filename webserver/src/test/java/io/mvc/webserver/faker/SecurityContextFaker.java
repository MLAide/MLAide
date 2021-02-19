package io.mvc.webserver.faker;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SecurityContextFaker {
    public static void setupUserInSecurityContext(String userName) {
        var authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(userName);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}
