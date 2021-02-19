package io.mvc.webserver.service;

import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ItemList;

import java.util.List;
import java.util.Optional;

public interface ExperimentService {
    boolean checkAllExperimentsExist(String projectKey, List<String> experimentKeys);
    ItemList<Experiment> getExperiments(String projectKey);
    Optional<Experiment> getExperiment(String projectKey, String experimentKey);
    Experiment addExperiment(String projectKey, Experiment experiment);
    void updateExperiment(String projectKey, Experiment experiment);
}
