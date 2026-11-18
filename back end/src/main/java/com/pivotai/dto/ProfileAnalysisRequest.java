package com.pivotai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Données du profil envoyées pour analyse")
public class ProfileAnalysisRequest {

    @NotNull(message = "Le CV est obligatoire.")
    @Schema(type = "string", format = "binary")
    private MultipartFile cv;

    @NotBlank(message = "Le métier actuel est obligatoire.")
    @Size(max = 100, message = "Le métier actuel ne peut pas dépasser 100 caractères.")
    private String currentJob;

    @NotBlank(message = "La région est obligatoire.")
    private String region;

    private List<@NotBlank String> hobbies = new ArrayList<>();

    @Valid
    private WorkPreferences preferences;
}
