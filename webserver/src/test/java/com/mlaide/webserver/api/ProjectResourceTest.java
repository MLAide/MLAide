package com.mlaide.webserver.api;

import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.repository.entity.MlAidePermission;
import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.service.PermissionService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.CoreMatchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ProjectResourceTest extends ApiTestWithExternalDependencies {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MongoTemplate mongo;

    @Autowired
    private PermissionService permissionService;

    @Nested
    class GetList {
        @Test
        @WithMockUser("default-user")
        void shouldReturnAllProjects() throws Exception {
            ProjectEntity project = ProjectFaker.newProjectEntity();
            mongo.save(project);
            permissionService.grantPermissionToNewProject(project.getKey(), MlAidePermission.OWNER);

            mockMvc.perform(get("/api/v1/projects"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[0].key", is(project.getKey())))
                    .andExpect(jsonPath("$.items[0].name", is(project.getName())))
                    .andExpect(jsonPath("$.items[0].createdAt", is(project.getCreatedAt().toString())));
        }
    }
}
