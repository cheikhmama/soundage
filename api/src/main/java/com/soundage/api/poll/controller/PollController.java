package com.soundage.api.poll.controller;

import com.soundage.api.common.response.ApiResponse;
import com.soundage.api.poll.dto.PollDetailDto;
import com.soundage.api.poll.dto.PollDto;
import com.soundage.api.poll.service.PollService;
import com.soundage.api.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PollDto>>> listActive() {
        List<PollDto> polls = pollService.findAllActive();
        return ResponseEntity.ok(ApiResponse.success("Active polls retrieved successfully", polls));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PollDetailDto>> getById(
            @PathVariable UUID id,
            @RequestParam(required = false) String anonymousId,
            Authentication authentication) {
        Optional<User> user = Optional.ofNullable(authentication)
                .filter(a -> a.getPrincipal() instanceof User)
                .map(a -> (User) a.getPrincipal());
        PollDetailDto poll = pollService.findByIdWithQuestions(id, user, Optional.ofNullable(anonymousId));
        return ResponseEntity.ok(ApiResponse.success(poll));
    }
}
