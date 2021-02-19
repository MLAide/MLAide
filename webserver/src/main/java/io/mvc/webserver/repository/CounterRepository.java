package io.mvc.webserver.repository;

public interface CounterRepository {
    int getNextSequenceValue(String sequenceName);
}
