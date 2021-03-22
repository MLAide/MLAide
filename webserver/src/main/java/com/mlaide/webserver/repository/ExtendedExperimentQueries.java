package com.mlaide.webserver.repository;

import java.util.List;

public interface ExtendedExperimentQueries {
    boolean checkAllExperimentsExist(String projectKey, List<String> experimentKeys);
}
