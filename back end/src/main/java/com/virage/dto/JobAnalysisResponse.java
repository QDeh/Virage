package com.virage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Analyse de compatibilité et parcours de reconversion")
public class JobAnalysisResponse {

    @NotNull
    @Min(0)
    @Max(100)
    private Integer compatibility;

    @NotNull
    private List<@NotBlank String> existingSkills;

    @NotNull
    private List<@NotBlank String> missingSkills;

    @NotBlank
    private String estimatedDuration;

    @NotNull
    private List<@Valid RoadmapStepDto> roadmap;

    @NotNull
    private List<@Valid TrainingDto> trainings;
}
