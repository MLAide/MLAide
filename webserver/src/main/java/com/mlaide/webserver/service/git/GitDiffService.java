package com.mlaide.webserver.service.git;

import com.mlaide.webserver.model.GitDiff;

public interface GitDiffService {
    GitDiff getDiff(String repositoryUri, String commitHash1, String commitHash2);
}
