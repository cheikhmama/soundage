package com.soundage.api.database.seed;

import com.soundage.api.role.entity.Role;
import com.soundage.api.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;

	@Override
	@Transactional
	public void run(String... args) {
		initializeRoles();
	}

	private void initializeRoles() {
		if (roleRepository.count() == 0) {
			log.info("Initializing roles...");
			roleRepository.save(Role.builder().name(Role.RoleName.ADMIN).build());
			roleRepository.save(Role.builder().name(Role.RoleName.USER).build());
			log.info("Roles initialized successfully");
		}
	}
}
