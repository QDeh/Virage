package com.virage.controller;

import com.virage.dto.JobAnalysisResponse;
import com.virage.dto.JobMatchResponse;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.service.CareerRoadmapService;
import com.virage.service.JobMatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Métiers", description = "Métiers compatibles et parcours de reconversion")
public class JobsController {

    private final JobMatchingService jobMatchingService;
    private final CareerRoadmapService careerRoadmapService;

    public JobsController(JobMatchingService jobMatchingService, CareerRoadmapService careerRoadmapService) {
        this.jobMatchingService = jobMatchingService;
        this.careerRoadmapService = careerRoadmapService;
    }

    @PostMapping("/match")
    @Operation(summary = "Trouver les métiers compatibles")
    public JobMatchResponse match(@Valid @RequestBody ProfileAnalysisResponse profile) {
        return jobMatchingService.match(profile);
    }

    @PostMapping("/{jobId}/analysis")
    @Operation(summary = "Analyser un métier et générer un parcours")
    public JobAnalysisResponse analyze(
            @PathVariable String jobId,
            @Valid @RequestBody ProfileAnalysisResponse profile) {
        return careerRoadmapService.analyzeJob(jobId, profile);
    }
}
