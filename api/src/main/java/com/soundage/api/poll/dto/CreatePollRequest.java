package com.soundage.api.poll.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePollRequest {

    @NotBlank(message = "Poll title is required")
    private String title;

    private String description;

    @Builder.Default
    private Boolean isActive = true;

    private Instant startsAt;
    private Instant endsAt;

    @Builder.Default
    private Boolean allowAnonymous = true;

    private Map<String, Object> settings;

    @Valid
    private List<CreateQuestionRequest> questions;
}
