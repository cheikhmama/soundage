package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Poll;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollDto {

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

    public static PollDto fromEntity(Poll p) {
        if (p == null)
            return null;
        Boolean allowAnonymous = null;
        if (p.getSettings() != null && p.getSettings().containsKey("allowAnonymous")) {
            Object v = p.getSettings().get("allowAnonymous");
            if (v instanceof Boolean)
                allowAnonymous = (Boolean) v;
        }
        return PollDto.builder()
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
                .build();
    }
}
