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
}
