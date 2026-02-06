package com.epam.rd.autocode.spring.project.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    void storeFile_ShouldSaveFileAndReturnPath() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        String result = fileStorageService.storeFile(file);

        assertTrue(result.startsWith("/uploads/"));
        String fileName = result.substring("/uploads/".length());
        assertTrue(Files.exists(tempDir.resolve(fileName)));
        assertEquals("content", Files.readString(tempDir.resolve(fileName)));
    }

    @Test
    void deleteFile_ShouldRemoveFile() throws IOException {
        Path testFile = tempDir.resolve("kill_me.txt");
        Files.writeString(testFile, "bye");
        assertTrue(Files.exists(testFile));

        fileStorageService.deleteFile("/uploads/kill_me.txt");

        assertFalse(Files.exists(testFile));
    }
}
