package io.mvc.webserver.controller;

import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.Run;

import javax.json.JsonMergePatch;

public interface PatchSupport {
    void patch(Run target, JsonMergePatch diff);
    void patch(Experiment target, JsonMergePatch diff);
}
