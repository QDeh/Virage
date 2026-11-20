package com.virage.service;

import com.virage.client.N8nClient;
import com.virage.dto.JobMatchResponse;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class JobMatchingService {

    private final N8nClient n8nClient;

    public JobMatchingService(N8nClient n8nClient) {
        this.n8nClient = n8nClient;
    }

    public JobMatchResponse match(ProfileAnalysisResponse profile) {
        JobMatchResponse response = n8nClient.matchJobs(profile);
        if (response.getJobs() == null) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "INVALID_JOB_MATCH_RESPONSE",
                    "Le workflow n8n « job-matching » doit renvoyer un objet JSON contenant un tableau « jobs ».");
        }
        return response;
    }
}
