package com.mlaide.webserver.service.git;

import com.mlaide.webserver.model.GitDiff;

import java.security.KeyPair;
import java.util.List;

public interface GitDiffService {
    GitDiff getDiff(String repositoryUri, String commitHash1, String commitHash2, List<KeyPair> keyPairs);
}
