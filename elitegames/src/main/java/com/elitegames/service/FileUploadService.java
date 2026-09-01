package com.elitegames.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${upload.path:./uploads}")
    private String uploadPath;

    public String uploadFile(MultipartFile file, String subDirectory) throws IOException {
        // Criar diretório se não existir
        Path uploadDir = Paths.get(uploadPath, subDirectory);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Gerar nome único para o arquivo
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Salvar arquivo
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar caminho relativo
        return "/uploads/" + subDirectory + "/" + fileName;
    }

    public boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get("." + filePath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            return false;
        }
    }
}