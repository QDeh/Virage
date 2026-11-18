package com.pivotai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Préférences professionnelles déclarées par la personne")
public class WorkPreferences {

    private String education;
    private String remote;

    @Min(0)
    @Max(100)
    private Integer team;

    @Min(0)
    @Max(100)
    private Integer office;

    @Min(0)
    @Max(100)
    private Integer technical;

    @Min(0)
    @Max(100)
    private Integer relational;

    private Boolean management;
    private Boolean travel;
    private Boolean autonomy;
}
