package com.soundage.api.poll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionCountDto {
    private UUID optionId;
    private String optionLabel;
    /** Optional image URL for image-choice options. */
    private String imageUrl;
    private long count;
    private double percentage;
}
