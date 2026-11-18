package com.pivotai.controller;

import com.pivotai.dto.ProfileAnalysisRequest;
import com.pivotai.dto.ProfileAnalysisResponse;
import com.pivotai.service.ProfileAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profil", description = "Analyse du profil professionnel")
public class ProfileController {

    private final ProfileAnalysisService profileAnalysisService;

    public ProfileController(ProfileAnalysisService profileAnalysisService) {
        this.profileAnalysisService = profileAnalysisService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyser un profil et son CV")
    public ProfileAnalysisResponse analyze(
            @Valid @ModelAttribute ProfileAnalysisRequest request,
            @RequestParam(value = "hobbies[]", required = false) List<String> hobbiesArray) {
        if (hobbiesArray != null) {
            request.setHobbies(hobbiesArray);
        }
        return profileAnalysisService.analyze(request);
    }
}
