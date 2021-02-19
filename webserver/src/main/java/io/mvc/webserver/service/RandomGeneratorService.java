package io.mvc.webserver.service;

import io.mvc.webserver.model.Experiment;

public interface RandomGeneratorService {
    String randomRunName();
    String randomExperimentName();
    Experiment randomExperiment();
}
