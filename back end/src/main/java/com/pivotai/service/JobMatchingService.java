package com.pivotai.service;

import com.pivotai.client.N8nClient;
import com.pivotai.dto.JobMatchResponse;
import com.pivotai.dto.ProfileAnalysisResponse;
import org.springframework.stereotype.Service;

@Service
public class JobMatchingService {

    private final N8nClient n8nClient;

    public JobMatchingService(N8nClient n8nClient) {
        this.n8nClient = n8nClient;
    }

    public JobMatchResponse match(ProfileAnalysisResponse profile) {
        return n8nClient.matchJobs(profile);
    }
}
