package com.mlaide.webserver.repository;

public interface CounterRepository {
    int getNextSequenceValue(String sequenceName);
}
