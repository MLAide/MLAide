package io.mvc.webserver.acl;

import io.mvc.webserver.acl.mongodb.AclRepository;
import io.mvc.webserver.acl.mongodb.BasicMongoLookupStrategy;
import io.mvc.webserver.acl.mongodb.MongoDBMutableAclService;
import io.mvc.webserver.repository.entity.MvcPermission;
import org.springframework.cache.ehcache.EhCacheFactoryBean;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.acls.AclPermissionEvaluator;
import org.springframework.security.acls.domain.AclAuthorizationStrategy;
import org.springframework.security.acls.domain.AclAuthorizationStrategyImpl;
import org.springframework.security.acls.domain.ConsoleAuditLogger;
import org.springframework.security.acls.domain.DefaultPermissionFactory;
import org.springframework.security.acls.domain.DefaultPermissionGrantingStrategy;
import org.springframework.security.acls.domain.EhCacheBasedAclCache;
import org.springframework.security.acls.domain.PermissionFactory;
import org.springframework.security.acls.jdbc.LookupStrategy;
import org.springframework.security.acls.model.AclCache;
import org.springframework.security.acls.model.AclService;
import org.springframework.security.acls.model.MutableAclService;
import org.springframework.security.acls.model.PermissionGrantingStrategy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Configuration
public class AclConfiguration {
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(PermissionEvaluator permissionEvaluator) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        expressionHandler.setPermissionEvaluator(permissionEvaluator);

        return expressionHandler;
    }

    @Bean
    public PermissionEvaluator permissionEvaluator(PermissionFactory permissionFactory, AclService aclService) {
        AclPermissionEvaluator permissionEvaluator = new AclPermissionEvaluator(aclService);
        permissionEvaluator.setPermissionFactory(permissionFactory);

        return permissionEvaluator;
    }

    @Bean
    public PermissionFactory permissionFactory() {
        return new DefaultPermissionFactory(MvcPermission.class);
    }

    @Bean
    public MutableAclService aclService(LookupStrategy lookupStrategy, AclCache aclCache, AclRepository aclRepository) {
        return new MongoDBMutableAclService(aclRepository, lookupStrategy, aclCache);
    }

    @Bean
    public AclAuthorizationStrategy aclAuthorizationStrategy() {
        return new AclAuthorizationStrategyImpl(
                new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Bean
    public PermissionGrantingStrategy permissionGrantingStrategy() {
        return new DefaultPermissionGrantingStrategy(new ConsoleAuditLogger());
    }

    @Bean
    public AclCache aclCache(PermissionGrantingStrategy permissionGrantingStrategy,
                             AclAuthorizationStrategy aclAuthorizationStrategy,
                             EhCacheFactoryBean ehCacheFactoryBean) {
        return new EhCacheBasedAclCache(
                ehCacheFactoryBean.getObject(),
                permissionGrantingStrategy,
                aclAuthorizationStrategy
        );
    }

    @Bean
    public EhCacheFactoryBean aclEhCacheFactoryBean(EhCacheManagerFactoryBean ehCacheManagerFactoryBean) {
        EhCacheFactoryBean ehCacheFactoryBean = new EhCacheFactoryBean();
        ehCacheFactoryBean.setCacheManager(ehCacheManagerFactoryBean.getObject());
        ehCacheFactoryBean.setCacheName("aclCache");
        return ehCacheFactoryBean;
    }

    @Bean
    public EhCacheManagerFactoryBean aclCacheManager() {
        EhCacheManagerFactoryBean cacheManagerFactory = new EhCacheManagerFactoryBean();
        cacheManagerFactory.setShared(true);
        return cacheManagerFactory;
    }

    @Bean
    public LookupStrategy lookupStrategy(MongoTemplate mongoTemplate,
                                         AclCache aclCache,
                                         AclAuthorizationStrategy aclAuthorizationStrategy,
                                         PermissionFactory permissionFactory) {
        return new BasicMongoLookupStrategy(
                mongoTemplate,
                aclCache,
                aclAuthorizationStrategy,
                new ConsoleAuditLogger(),
                permissionFactory
        );
    }
}
