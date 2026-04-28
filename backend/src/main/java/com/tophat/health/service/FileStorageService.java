package com.tophat.health.service;

import com.tophat.health.config.AppStorageProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final AppStorageProperties properties;
    private Path storageRoot;

    public FileStorageService(AppStorageProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() throws IOException {
        storageRoot = Path.of(properties.location());
        Files.createDirectories(storageRoot);
    }

    public String save(MultipartFile file, String folder) {
        try {
            Path targetFolder = storageRoot.resolve(folder);
            Files.createDirectories(targetFolder);
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path target = targetFolder.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return folder + "/" + filename;
        } catch (IOException e) {
            throw new IllegalStateException("Could not store file", e);
        }
    }
}
