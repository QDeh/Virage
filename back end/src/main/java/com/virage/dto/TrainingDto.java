package com.virage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Formation recommandée")
public class TrainingDto {

    @NotBlank
    private String title;

    @NotBlank
    private String organization;

    @NotBlank
    private String duration;

    @NotBlank
    private String level;

    private String url;
}
