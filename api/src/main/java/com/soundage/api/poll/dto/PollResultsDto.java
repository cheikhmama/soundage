package com.soundage.api.poll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollResultsDto {
    private UUID pollId;
    private String pollTitle;
    private long totalResponses;
    private List<QuestionResultDto> questionResults;
    /** Names and emails of voters (or "Anonymous" for anonymous votes). */
    private List<VoterInfoDto> voters;
}
