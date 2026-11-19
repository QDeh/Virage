package com.virage.service;

import com.virage.client.N8nClient;
import com.virage.client.N8nProfileAnalysisRequest;
import com.virage.dto.ProfileAnalysisRequest;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileAnalysisServiceTest {

    @Mock
    private N8nClient n8nClient;

    @InjectMocks
    private ProfileAnalysisService service;

    @Test
    void forwardsCvAndProfileToN8n() {
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "%PDF".getBytes());
        ProfileAnalysisRequest request = new ProfileAnalysisRequest(
                cv, " Conseiller ", "Bretagne", List.of("Informatique"), null);
        ProfileAnalysisResponse expected = new ProfileAnalysisResponse(
                List.of("Excel"), List.of("Écoute"), List.of("Relation client"), "Profil");
        when(n8nClient.analyzeProfile(org.mockito.ArgumentMatchers.any())).thenReturn(expected);

        ProfileAnalysisResponse result = service.analyze(request);

        assertEquals(expected, result);
        ArgumentCaptor<N8nProfileAnalysisRequest> payload =
                ArgumentCaptor.forClass(N8nProfileAnalysisRequest.class);
        verify(n8nClient).analyzeProfile(payload.capture());
        assertEquals("Conseiller", payload.getValue().currentJob());
        assertEquals("cv.pdf", payload.getValue().cvFileName());
        assertEquals("JVBERg==", payload.getValue().cvBase64());
        assertEquals(List.of("Informatique"), payload.getValue().hobbies());
    }

    @Test
    void rejectsUnsupportedExtensionBeforeCallingN8n() {
        ProfileAnalysisRequest request = new ProfileAnalysisRequest(
                new MockMultipartFile("cv", "cv.txt", "text/plain", "text".getBytes()),
                "Conseiller", "Bretagne", List.of(), null);

        BusinessException exception = assertThrows(BusinessException.class, () -> service.analyze(request));

        assertEquals("INVALID_FILE_TYPE", exception.getCode());
    }
}
