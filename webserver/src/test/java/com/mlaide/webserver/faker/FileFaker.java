package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Random;

public class FileFaker {
    private final static Random random = new Random();
    private final static Faker faker = new Faker();

    public static byte[] randomBytes(int size) {
        byte[] bytes = new byte[size];
        random.nextBytes(bytes);

        return bytes;
    }

    public static InputStream randomInputStream() {
        var bytes = randomBytes(faker.random().nextInt(10000));

        return new ByteArrayInputStream(bytes);
    }

    public static String randomFileName() {
        return faker.lorem().word() + "." + faker.file().extension();
    }
}
