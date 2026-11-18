package com.pivotai.service;

import com.pivotai.client.N8nClient;
import com.pivotai.client.N8nProfileAnalysisRequest;
import com.pivotai.dto.ProfileAnalysisRequest;
import com.pivotai.dto.ProfileAnalysisResponse;
import com.pivotai.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class ProfileAnalysisService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".pdf", ".docx");

    private final N8nClient n8nClient;

    public ProfileAnalysisService(N8nClient n8nClient) {
        this.n8nClient = n8nClient;
    }

    public ProfileAnalysisResponse analyze(ProfileAnalysisRequest request) {
        MultipartFile cv = request.getCv();
        validateFile(cv);
        try {
            N8nProfileAnalysisRequest workflowRequest = new N8nProfileAnalysisRequest(
                    StringUtils.cleanPath(cv.getOriginalFilename()),
                    cv.getContentType(),
                    Base64.getEncoder().encodeToString(cv.getBytes()),
                    request.getCurrentJob().trim(),
                    request.getRegion().trim(),
                    request.getHobbies() == null ? List.of() : List.copyOf(request.getHobbies()),
                    request.getPreferences());
            return n8nClient.analyzeProfile(workflowRequest);
        } catch (IOException exception) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "FILE_READ_ERROR",
                    "Le fichier CV n’a pas pu être lu.");
        }
    }

    private void validateFile(MultipartFile cv) {
        if (cv == null || cv.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_FILE",
                    "Le CV est obligatoire et ne peut pas être vide.");
        }
        if (cv.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE",
                    "Le fichier ne doit pas dépasser 10 Mo.");
        }
        String filename = cv.getOriginalFilename();
        String extension = filename == null ? "" : filename.substring(filename.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE",
                    "Le CV doit être au format PDF ou DOCX.");
        }
    }
}
