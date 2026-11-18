package com.pivotai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Étape mensuelle du parcours")
public class RoadmapStepDto {

    @NotNull
    @Positive
    private Integer month;

    @NotNull
    private List<String> objectives;
}
