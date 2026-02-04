package com.soundage.api.poll.dto;

import jakarta.validation.Valid;
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
public class UpdatePollRequest {

    private String title;
    private String description;
    private Boolean isActive;
    private Instant startsAt;
    private Instant endsAt;
    private Boolean allowAnonymous;
    private Map<String, Object> settings;
    @Valid
    private List<CreateQuestionRequest> questions;
}
