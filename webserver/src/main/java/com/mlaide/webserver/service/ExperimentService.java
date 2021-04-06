package com.mlaide.webserver.service;

import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ItemList;

import java.util.List;

public interface ExperimentService {
    boolean checkAllExperimentsExist(String projectKey, List<String> experimentKeys);
    ItemList<Experiment> getExperiments(String projectKey);
    Experiment getExperiment(String projectKey, String experimentKey);
    Experiment addExperiment(String projectKey, Experiment experiment);
    void updateExperiment(String projectKey, Experiment experiment);
}
