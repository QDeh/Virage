package com.virage.client;

import com.virage.configuration.N8nProperties;
import com.virage.dto.JobAnalysisResponse;
import com.virage.dto.JobMatchResponse;
import com.virage.dto.ProfileAnalysisResponse;
import com.virage.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Map;
import java.net.ConnectException;
import java.net.UnknownHostException;
import javax.net.ssl.SSLException;
import java.util.concurrent.TimeoutException;

@Component
public class N8nClient {

    private static final Logger log = LoggerFactory.getLogger(N8nClient.class);

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
            int n8nStatus = exception.getStatusCode().value();
            log.warn("Le webhook n8n a répondu avec le statut HTTP {}.", n8nStatus);
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "WORKFLOW_ERROR",
                    workflowErrorMessage(n8nStatus));
        } catch (WebClientRequestException exception) {
            throw unavailable(exception);
        } catch (RuntimeException exception) {
            if (hasCause(exception, TimeoutException.class)) {
                throw new BusinessException(HttpStatus.GATEWAY_TIMEOUT, "WORKFLOW_TIMEOUT",
                        "Le délai d’attente du workflow n8n est dépassé.");
            }
            throw exception;
        }
    }

    private BusinessException unavailable(WebClientRequestException exception) {
        Throwable cause = mostSpecificCause(exception);
        String causeType = cause.getClass().getSimpleName();
        log.warn("Impossible de joindre le webhook n8n (cause réseau : {}).", causeType);

        String message;
        if (cause instanceof SSLException) {
            message = "La connexion HTTPS à n8n a échoué. Vérifiez le certificat TLS et le truststore Java du backend.";
        } else if (cause instanceof UnknownHostException) {
            message = "Le nom d’hôte n8n est introuvable depuis le backend. Vérifiez l’URL et le DNS.";
        } else if (cause instanceof ConnectException) {
            message = "La connexion au serveur n8n a été refusée. Vérifiez son adresse, son port et son accessibilité depuis le backend.";
        } else {
            message = "Le backend n’a pas pu établir la connexion au webhook n8n. Vérifiez l’URL et l’accès réseau.";
        }
        return new BusinessException(HttpStatus.BAD_GATEWAY, "WORKFLOW_UNAVAILABLE", message);
    }

    private String workflowErrorMessage(int n8nStatus) {
        if (n8nStatus == 404) {
            return "n8n répond HTTP 404 : webhook introuvable ou inactif. Vérifiez le chemin et, en mode test, relancez « Execute workflow » avant l’appel.";
        }
        if (n8nStatus == 400) {
            return "n8n répond HTTP 400 : la requête n’a pas été acceptée. Vérifiez les données attendues par le workflow.";
        }
        if (n8nStatus >= 500) {
            return "n8n répond HTTP " + n8nStatus
                    + " : une étape du workflow a échoué. Consultez le détail de l’exécution dans n8n.";
        }
        return "n8n répond HTTP " + n8nStatus
                + " : vérifiez la configuration et les données attendues par le workflow.";
    }

    private Throwable mostSpecificCause(Throwable exception) {
        Throwable cause = exception;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
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
