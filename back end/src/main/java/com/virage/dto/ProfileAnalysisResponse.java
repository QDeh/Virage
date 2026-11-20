package com.virage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Résultat de l’analyse du profil")
public class ProfileAnalysisResponse {

    @NotNull
    private List<@NotBlank String> technicalSkills;

    @NotNull
    private List<@NotBlank String> softSkills;

    @NotNull
    private List<@NotBlank String> transferableSkills;

    @NotBlank
    private String profileSummary;

    private String region;

    private List<String> hobbies;

    private WorkPreferences preferences;

    public ProfileAnalysisResponse(
            List<String> technicalSkills,
            List<String> softSkills,
            List<String> transferableSkills,
            String profileSummary) {
        this(technicalSkills, softSkills, transferableSkills, profileSummary, null, null, null);
    }

    public ProfileAnalysisResponse(
            List<String> technicalSkills,
            List<String> softSkills,
            List<String> transferableSkills,
            String profileSummary,
            String region,
            List<String> hobbies) {
        this(technicalSkills, softSkills, transferableSkills, profileSummary, region, hobbies, null);
    }
}
