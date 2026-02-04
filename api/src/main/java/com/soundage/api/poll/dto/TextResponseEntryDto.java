package com.soundage.api.poll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextResponseEntryDto {
    private String displayName;
    private String email;
    private boolean anonymous;
    private String text;
}
