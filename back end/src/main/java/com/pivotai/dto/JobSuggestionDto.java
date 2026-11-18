package com.pivotai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Métier compatible suggéré")
public class JobSuggestionDto {

    @NotBlank
    private String name;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer score;

    @NotBlank
    private String description;

    @NotBlank
    private String reason;
}
