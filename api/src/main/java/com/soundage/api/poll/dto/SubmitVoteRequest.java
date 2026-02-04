package com.soundage.api.poll.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVoteRequest {

    /**
     * Anonymous identifier (e.g. session/cookie). Required when voting without
     * authentication on a public poll.
     */
    private String anonymousId;

    @Valid
    @NotEmpty(message = "At least one answer is required")
    private List<AnswerInputDto> answers;
}
