package com.virage.service;

import com.virage.client.N8nClient;
import com.virage.dto.JobAnalysisResponse;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class CareerRoadmapService {

    private final N8nClient n8nClient;

    public CareerRoadmapService(N8nClient n8nClient) {
        this.n8nClient = n8nClient;
    }

    public JobAnalysisResponse analyzeJob(String jobId, ProfileAnalysisResponse profile) {
        if (!StringUtils.hasText(jobId)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_JOB",
                    "Le métier sélectionné est obligatoire.");
        }
        return n8nClient.generateRoadmap(profile, jobId.trim());
    }
}
