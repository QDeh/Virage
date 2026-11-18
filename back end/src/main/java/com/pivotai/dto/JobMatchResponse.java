package com.pivotai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Liste des métiers compatibles")
public class JobMatchResponse {

    @NotNull
    private List<@Valid JobSuggestionDto> jobs;
}
