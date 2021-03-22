package com.mlaide.webserver.service;

import com.mlaide.webserver.model.Experiment;

public interface RandomGeneratorService {
    String randomRunName();
    String randomExperimentName();
    Experiment randomExperiment();
}
