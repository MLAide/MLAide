/*
 * Copyright 2002-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.mvc.webserver.acl.mongodb.entity;

public class MongoSid {
    private String name;
    private boolean isPrincipal;

    public MongoSid() {
    }

    public MongoSid(String name) {
        this.name = name;
        this.isPrincipal = true;
    }

    public MongoSid(String name, boolean isPrincipal) {
        this.name = name;
        this.isPrincipal = isPrincipal;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isPrincipal() {
        return this.isPrincipal;
    }

    public void setPrincipal(boolean isPrincipal) {
        this.isPrincipal = isPrincipal;
    }

    @Override
    public String toString() {
        return "MongoSid[name = " + name + ", isPrincipal = " + isPrincipal + "]";
    }
}
