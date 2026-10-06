package com.elitegames.service_tests;

import com.elitegames.service.FileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Tag("unit")
public class FileUploadServiceTest {

    @TempDir
    Path tempDir;

    private FileUploadService fileUploadService;

    @BeforeEach
    void setUp() {
        fileUploadService = new FileUploadService();
        ReflectionTestUtils.setField(fileUploadService, "uploadPath", tempDir.toString());
    }

    // ---------- uploadFile ----------

    @Test
    @DisplayName("uploadFile: saves file and returns /uploads/... path")
    void uploadFile_whenValid_savesAndReturnsPath() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", "conteudo".getBytes());

        String path = fileUploadService.uploadFile(file, "avatars");

        assertTrue(path.startsWith("/uploads/avatars/"));
        assertTrue(path.endsWith(".png"));

        String filename = path.substring(path.lastIndexOf('/') + 1);
        Path saved = tempDir.resolve("avatars").resolve(filename);

        assertTrue(Files.exists(saved));
        assertEquals("conteudo", Files.readString(saved));
    }

    @Test
    @DisplayName("uploadFile: creates subdirectory when missing")
    void uploadFile_whenSubdirMissing_createsIt() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "x".getBytes());

        fileUploadService.uploadFile(file, "nova-pasta");

        assertTrue(Files.isDirectory(tempDir.resolve("nova-pasta")));
    }

    @Test
    @DisplayName("uploadFile: generates unique name for repeated filenames")
    void uploadFile_whenSameNameTwice_generatesDifferentPaths() throws IOException {
        MockMultipartFile f1 = new MockMultipartFile(
                "file", "avatar.png", "image/png", "a".getBytes());
        MockMultipartFile f2 = new MockMultipartFile(
                "file", "avatar.png", "image/png", "b".getBytes());

        String p1 = fileUploadService.uploadFile(f1, "avatars");
        String p2 = fileUploadService.uploadFile(f2, "avatars");

        assertNotEquals(p1, p2);
    }

    @Test
    @DisplayName("uploadFile: preserves original extension")
    void uploadFile_preservesExtension() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.JPEG", "image/jpeg", "x".getBytes());

        String path = fileUploadService.uploadFile(file, "avatars");

        assertTrue(path.endsWith(".JPEG"));
    }

    @Test
    @DisplayName("uploadFile: handles filename without extension")
    void uploadFile_whenNoExtension_savesWithoutExtension() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "README", "text/plain", "x".getBytes());

        String path = fileUploadService.uploadFile(file, "docs");

        String filename = path.substring(path.lastIndexOf('/') + 1);
        assertFalse(filename.contains("."));
    }

    @Test
    @DisplayName("uploadFile: handles null original filename")
    void uploadFile_whenFilenameNull_savesWithoutExtension() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", null, "application/octet-stream", "x".getBytes());

        String path = fileUploadService.uploadFile(file, "misc");

        assertNotNull(path);
        assertTrue(path.startsWith("/uploads/misc/"));

        String filename = path.substring(path.lastIndexOf('/') + 1);
        assertFalse(filename.contains("."));
    }

    @Test
    @DisplayName("uploadFile: handles empty file")
    void uploadFile_whenEmpty_savesEmptyFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.txt", "text/plain", new byte[0]);

        String path = fileUploadService.uploadFile(file, "docs");

        String filename = path.substring(path.lastIndexOf('/') + 1);
        Path saved = tempDir.resolve("docs").resolve(filename);

        assertTrue(Files.exists(saved));
        assertEquals(0, Files.size(saved));
    }

    // ---------- deleteFile ----------

    @Test
    @DisplayName("deleteFile: removes existing file and returns true")
    void deleteFile_whenExists_deletesAndReturnsTrue() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "x.png", "image/png", "x".getBytes());
        String returned = fileUploadService.uploadFile(file, "avatars");

        boolean deleted = fileUploadService.deleteFile(returned);

        assertTrue(deleted);

        String filename = returned.substring(returned.lastIndexOf('/') + 1);
        Path saved = tempDir.resolve("avatars").resolve(filename);
        assertFalse(Files.exists(saved));
    }

    @Test
    @DisplayName("deleteFile: returns false when file does not exist")
    void deleteFile_whenMissing_returnsFalse() {
        boolean deleted = fileUploadService.deleteFile("/uploads/ghost.png");
        assertFalse(deleted);
    }

    @Test
    @DisplayName("deleteFile: accepts path without /uploads/ prefix")
    void deleteFile_withoutPrefix_stillWorks() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "x.png", "image/png", "x".getBytes());
        String returned = fileUploadService.uploadFile(file, "avatars");

        // tira o prefixo "/uploads/" e passa "avatars/<uuid>.png"
        String withoutPrefix = returned.substring("/uploads/".length());

        boolean deleted = fileUploadService.deleteFile(withoutPrefix);

        assertTrue(deleted);
    }

    @Test
    @DisplayName("deleteFile: does not throw when path is null-safe (empty)")
    void deleteFile_whenPathEmpty_returnsFalse() {
        boolean deleted = fileUploadService.deleteFile("");
        assertFalse(deleted);
    }
}