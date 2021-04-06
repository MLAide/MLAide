package com.mlaide.webserver.service;

import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.ItemList;

import java.util.List;

public interface RunService {
    ItemList<Run> getRuns(String projectKey);
    ItemList<Run> getRunsByKeys(String projectKey, List<Integer> runKeys);
    ItemList<Run> getRunsOfExperiment(String projectKey, String experimentKey);
    Run addRun(String projectKey, Run run);
    Run getRun(String projectKey, Integer runKey);
    void updateRun(String projectKey, Run run);
    String createOrUpdateNote(String projectKey, Integer runKey, String note);
    void attachArtifactToRun(String projectKey, Integer runKey, String artifactEntityName, Integer artifactVersion);
}
