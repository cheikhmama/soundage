package com.soundage.api.user.service;

import com.soundage.api.role.entity.Role;
import com.soundage.api.role.repository.RoleRepository;
import com.soundage.api.user.dto.UserDto;
import com.soundage.api.user.entity.User;
import com.soundage.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAllForAdmin(String search, String role) {
        List<User> list = (search == null || search.isBlank())
                ? userRepository.findAll()
                : userRepository.findAllForAdminSearch(search.trim());
        if (role != null && !role.isBlank()) {
            try {
                Role.RoleName rn = Role.RoleName.valueOf(role.trim().toUpperCase());
                list = list.stream().filter(u -> u.getRole().getName() == rn).toList();
            } catch (IllegalArgumentException ignored) {
                // keep all if invalid role
            }
        }
        return list.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(String name, String lastName, String email, String password, Role.RoleName roleName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        User user = User.builder()
                .name(name)
                .lastName(lastName)
                .email(email)
                .password(password)
                .role(role)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }
}
