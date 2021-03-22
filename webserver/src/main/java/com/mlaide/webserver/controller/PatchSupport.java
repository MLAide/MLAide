package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.Run;

import javax.json.JsonMergePatch;

public interface PatchSupport {
    void patch(Run target, JsonMergePatch diff);
    void patch(Experiment target, JsonMergePatch diff);
}
