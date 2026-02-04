package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Poll;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollDetailDto {

    private UUID id;
    private String title;
    private String description;
    private Boolean isActive;
    private Instant startsAt;
    private Instant endsAt;
    private UUID createdById;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean allowAnonymous;
    private Map<String, Object> settings;
    private List<QuestionDto> questions;
    /**
     * True if the current user (or anonymousId) has already submitted a response
     * for this poll.
     */
    private Boolean hasVoted;

    public static PollDetailDto fromEntity(Poll p) {
        if (p == null)
            return null;
        Boolean allowAnonymous = null;
        if (p.getSettings() != null && p.getSettings().containsKey("allowAnonymous")) {
            Object v = p.getSettings().get("allowAnonymous");
            if (v instanceof Boolean)
                allowAnonymous = (Boolean) v;
        }
        List<QuestionDto> questions = p.getQuestions() != null
                ? p.getQuestions().stream().map(QuestionDto::fromEntity).collect(Collectors.toList())
                : List.of();
        return PollDetailDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .isActive(p.getIsActive())
                .startsAt(p.getStartsAt())
                .endsAt(p.getEndsAt())
                .createdById(p.getCreatedBy() != null ? p.getCreatedBy().getId() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .allowAnonymous(allowAnonymous)
                .settings(p.getSettings())
                .questions(questions)
                .build();
    }
}
