package com.virage.client;

import com.virage.dto.WorkPreferences;

import java.util.List;

public record N8nProfileAnalysisRequest(
        String cvFileName,
        String cvContentType,
        String cvBase64,
        String currentJob,
        String region,
        List<String> hobbies,
        WorkPreferences preferences
) {
}
