package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.FileHash;

public class FileHashFaker {
    private static final Faker faker = new Faker();
    public static FileHash newFileHash() {
        var fileHash = new FileHash();

        fileHash.setFileHash(faker.funnyName().name());
        fileHash.setFileName(faker.funnyName().name());

        return fileHash;
    }
}
