package com.virage.service;

import com.virage.client.N8nClient;
import com.virage.dto.JobAnalysisResponse;
import com.virage.dto.JobMatchResponse;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServicesTest {

    @Mock
    private N8nClient n8nClient;

    @InjectMocks
    private JobMatchingService jobMatchingService;

    @Test
    void matchingDelegatesToWorkflow() {
        ProfileAnalysisResponse profile = profile();
        JobMatchResponse expected = new JobMatchResponse(List.of());
        when(n8nClient.matchJobs(profile)).thenReturn(expected);

        assertEquals(expected, jobMatchingService.match(profile));
        verify(n8nClient).matchJobs(profile);
    }

    @Test
    void matchingRejectsWorkflowResponseWithoutJobsArray() {
        ProfileAnalysisResponse profile = profile();
        when(n8nClient.matchJobs(profile)).thenReturn(new JobMatchResponse(null));

        BusinessException exception = assertThrows(
                BusinessException.class, () -> jobMatchingService.match(profile));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
        assertEquals("INVALID_JOB_MATCH_RESPONSE", exception.getCode());
    }

    @Test
    void roadmapDelegatesSelectedJobAndProfileToWorkflow() {
        CareerRoadmapService service = new CareerRoadmapService(n8nClient);
        ProfileAnalysisResponse profile = profile();
        JobAnalysisResponse expected = new JobAnalysisResponse(
                89, List.of(), List.of(), "6 mois", List.of(), List.of());
        when(n8nClient.generateRoadmap(profile, "Technicien Support")).thenReturn(expected);

        assertEquals(expected, service.analyzeJob(" Technicien Support ", profile));
        verify(n8nClient).generateRoadmap(profile, "Technicien Support");
    }

    @Test
    void roadmapRejectsBlankJobId() {
        CareerRoadmapService service = new CareerRoadmapService(n8nClient);

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.analyzeJob("  ", profile()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    private ProfileAnalysisResponse profile() {
        return new ProfileAnalysisResponse(List.of("Excel"), List.of("Écoute"),
                List.of("Relation client"), "Profil");
    }
}
