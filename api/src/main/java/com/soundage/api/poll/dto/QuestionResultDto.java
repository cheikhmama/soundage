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
public class QuestionResultDto {
    private UUID questionId;
    private String questionTitle;
    private String type; // single_choice, multiple_choice, yes_no, text, rating

    /**
     * For single_choice, multiple_choice, yes_no: count and percentage per option
     */
    private List<OptionCountDto> optionCounts;

    /** For rating: distribution 1-5 and average */
    private List<RatingBucketDto> ratingDistribution;
    private Double averageRating;

    /** For text: list of response strings (plain). */
    private List<String> textResponses;
    /**
     * For text: list of responses with voter info (name, email, text) for display
     * as comments.
     */
    private List<TextResponseEntryDto> textResponseEntries;
}
