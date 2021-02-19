package io.mvc.webserver.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;

import javax.servlet.http.HttpServletRequest;

@Configuration
public class RestTemplateConfig {
    @Bean(name = "token-propagation-rest-template")
    @RequestScope
    public RestTemplate authTokenAddedRestTemplate(HttpServletRequest inReq) {

        final String authHeader = inReq.getHeader(HttpHeaders.AUTHORIZATION);
        // TODO: Warning: RestTemplate can have memory leaks if it is request scoped
        // ==> connection will not be closed if RestTemplate object is garbage collected before response arrives
        final RestTemplate restTemplate = new RestTemplate();

        if (authHeader != null && !authHeader.isEmpty()) {
            restTemplate.getInterceptors().add(
                (outReq, bytes, clientHttpReqExec) -> {
                    outReq.getHeaders().set(HttpHeaders.AUTHORIZATION, authHeader);
                    return clientHttpReqExec.execute(outReq, bytes);
                });
        }
        return restTemplate;
    }
}
