package com.virage.controller;

import com.virage.dto.ProfileAnalysisResponse;
import com.virage.dto.ProfileAnalysisRequest;
import com.virage.service.CareerRoadmapService;
import com.virage.service.JobMatchingService;
import com.virage.service.ProfileAnalysisService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {HealthController.class, ProfileController.class, JobsController.class})
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileAnalysisService profileAnalysisService;

    @MockBean
    private JobMatchingService jobMatchingService;

    @MockBean
    private CareerRoadmapService careerRoadmapService;

    @Test
    void healthReturnsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void profileEndpointAcceptsMultipartAndRepeatedHobbies() throws Exception {
        ProfileAnalysisResponse response = profile();
        when(profileAnalysisService.analyze(any())).thenReturn(response);
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "%PDF".getBytes());

        mockMvc.perform(multipart("/api/profile/analyze")
                        .file(cv)
                        .param("currentJob", "Conseiller")
                        .param("region", "Bretagne")
                        .param("preferences.education", "Bac +2")
                        .param("preferences.team", "65")
                        .param("hobbies[]", "Informatique")
                        .param("hobbies[]", "Formation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileSummary").value("Profil"));

        ArgumentCaptor<ProfileAnalysisRequest> request =
                ArgumentCaptor.forClass(ProfileAnalysisRequest.class);
        verify(profileAnalysisService).analyze(request.capture());
        assertEquals("Conseiller", request.getValue().getCurrentJob());
        assertEquals(List.of("Informatique", "Formation"), request.getValue().getHobbies());
        assertEquals("Bac +2", request.getValue().getPreferences().getEducation());
        assertEquals(Integer.valueOf(65), request.getValue().getPreferences().getTeam());
    }

    @Test
    void matchingEndpointDelegatesProfileToService() throws Exception {
        when(jobMatchingService.match(any())).thenReturn(new com.virage.dto.JobMatchResponse(List.of()));

        mockMvc.perform(post("/api/jobs/match")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"technicalSkills":["Excel"],"softSkills":["Écoute"],
                                 "transferableSkills":["Relation client"],"profileSummary":"Profil"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs").isArray());
    }

    @Test
    void jobAnalysisPassesSelectedJob() throws Exception {
        when(careerRoadmapService.analyzeJob(eq("support"), any())).thenReturn(
                new com.virage.dto.JobAnalysisResponse(89, List.of(), List.of(),
                        "6 mois", List.of(), List.of()));

        mockMvc.perform(post("/api/jobs/support/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"technicalSkills":["Excel"],"softSkills":["Écoute"],
                                 "transferableSkills":["Relation client"],"profileSummary":"Profil"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compatibility").value(89));
    }

    @Test
    void profileEndpointRejectsMissingRequiredFields() throws Exception {
        mockMvc.perform(multipart("/api/profile/analyze"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_DATA"));
    }

    private ProfileAnalysisResponse profile() {
        return new ProfileAnalysisResponse(List.of("Excel"), List.of("Écoute"),
                List.of("Relation client"), "Profil");
    }
}
