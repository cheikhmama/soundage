package com.soundage.api.user.controller;

import com.soundage.api.common.response.ApiResponse;
import com.soundage.api.config.security.RequiresAdmin;
import com.soundage.api.user.dto.UserDto;
import com.soundage.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @RequiresAdmin
    public ResponseEntity<ApiResponse<List<UserDto>>> listAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        List<UserDto> users = userService.findAllForAdmin(search, role);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }
}
