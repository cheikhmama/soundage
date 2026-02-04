package com.soundage.api.poll.controller;

import com.soundage.api.common.response.ApiResponse;
import com.soundage.api.poll.dto.SubmitVoteRequest;
import com.soundage.api.poll.dto.SubmitVoteResponse;
import com.soundage.api.poll.service.VoteService;
import com.soundage.api.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping("/{pollId}/responses")
    public ResponseEntity<ApiResponse<SubmitVoteResponse>> submitVote(
            @PathVariable UUID pollId,
            @Valid @RequestBody SubmitVoteRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        Optional<User> user = Optional.ofNullable(authentication)
                .filter(a -> a.getPrincipal() instanceof User)
                .map(a -> (User) a.getPrincipal());

        String clientIp = httpRequest.getRemoteAddr();

        SubmitVoteResponse response = voteService.submitResponse(pollId, request, user, clientIp);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}
