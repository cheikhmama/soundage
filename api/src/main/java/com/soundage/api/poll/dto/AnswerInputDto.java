package com.soundage.api.poll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerInputDto {

    @NotNull(message = "Question ID is required")
    private UUID questionId;

    private UUID optionId;
    private List<UUID> optionIds;
    private String textValue;
    private BigDecimal numericValue;
    private List<RankingEntryDto> ranking;
}
