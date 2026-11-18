package com.pivotai.client;

import com.pivotai.configuration.N8nProperties;
import com.pivotai.dto.JobAnalysisResponse;
import com.pivotai.dto.JobMatchResponse;
import com.pivotai.dto.ProfileAnalysisResponse;
import com.pivotai.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;

@Component
public class N8nClient {

    private final WebClient webClient;
    private final N8nProperties properties;

    public N8nClient(WebClient n8nWebClient, N8nProperties properties) {
        this.webClient = n8nWebClient;
        this.properties = properties;
    }

    public ProfileAnalysisResponse analyzeProfile(N8nProfileAnalysisRequest request) {
        return post(properties.getProfileAnalysisUrl(), request, ProfileAnalysisResponse.class);
    }

    public JobMatchResponse matchJobs(ProfileAnalysisResponse profile) {
        return post(properties.getJobMatchingUrl(), profile, JobMatchResponse.class);
    }

    public JobAnalysisResponse generateRoadmap(ProfileAnalysisResponse profile, String jobId) {
        return post(properties.getRoadmapUrl(),
                Map.of("profile", profile, "selectedJob", jobId),
                JobAnalysisResponse.class);
    }

    private <T> T post(String url, Object payload, Class<T> responseType) {
        try {
            T response = webClient.post()
                    .uri(url)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(responseType)
                    .block(Duration.ofSeconds(properties.getTimeoutSeconds()));
            if (response == null) {
                throw new BusinessException(HttpStatus.BAD_GATEWAY, "EMPTY_WORKFLOW_RESPONSE",
                        "Le workflow n8n a renvoyé une réponse vide.");
            }
            return response;
        } catch (BusinessException exception) {
            throw exception;
        } catch (WebClientResponseException exception) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "WORKFLOW_ERROR",
                    "Le workflow n8n a refusé ou échoué à traiter la demande.");
        } catch (WebClientRequestException exception) {
            throw unavailable();
        } catch (RuntimeException exception) {
            if (hasCause(exception, TimeoutException.class)) {
                throw new BusinessException(HttpStatus.GATEWAY_TIMEOUT, "WORKFLOW_TIMEOUT",
                        "Le délai d’attente du workflow n8n est dépassé.");
            }
            throw exception;
        }
    }

    private BusinessException unavailable() {
        return new BusinessException(HttpStatus.BAD_GATEWAY, "WORKFLOW_UNAVAILABLE",
                "Le workflow n8n est indisponible.");
    }

    private boolean hasCause(Throwable exception, Class<? extends Throwable> type) {
        Throwable current = exception;
        while (current != null) {
            if (type.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
