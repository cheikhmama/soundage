package com.soundage.api.poll.controller;

import com.soundage.api.common.response.ApiResponse;
import com.soundage.api.config.security.RequiresAdmin;
import com.soundage.api.poll.dto.PollDetailDto;
import com.soundage.api.poll.dto.PollDto;
import com.soundage.api.poll.dto.PollResultsDto;
import com.soundage.api.poll.dto.CreatePollRequest;
import com.soundage.api.poll.dto.UpdatePollRequest;
import com.soundage.api.poll.service.PollService;
import com.soundage.api.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/polls")
@RequiredArgsConstructor
public class AdminPollController {

    private final PollService pollService;

    @GetMapping
    @RequiresAdmin
    public ResponseEntity<ApiResponse<java.util.List<PollDto>>> listAll(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        java.util.List<PollDto> polls = pollService.findAllForAdmin(search, status, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Polls retrieved successfully", polls));
    }

    @GetMapping("/{id}")
    @RequiresAdmin
    public ResponseEntity<ApiResponse<PollDetailDto>> getById(@PathVariable UUID id) {
        PollDetailDto poll = pollService.findByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(poll));
    }

    @GetMapping("/{id}/results")
    @RequiresAdmin
    public ResponseEntity<ApiResponse<PollResultsDto>> getResults(@PathVariable UUID id) {
        PollResultsDto results = pollService.findResults(id);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @PostMapping
    @RequiresAdmin
    public ResponseEntity<ApiResponse<PollDetailDto>> create(
            @Valid @RequestBody CreatePollRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        PollDetailDto created = pollService.create(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Poll created successfully", created));
    }

    @PutMapping("/{id}")
    @RequiresAdmin
    public ResponseEntity<ApiResponse<PollDetailDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePollRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        PollDetailDto updated = pollService.update(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Poll updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @RequiresAdmin
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        pollService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
