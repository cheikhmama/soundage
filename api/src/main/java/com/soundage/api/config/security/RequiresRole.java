package com.soundage.api.config.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to require a specific role.
 * Usage: @RequiresRole("ADMIN") or @RequiresRole("USER")
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface RequiresRole {
    /**
     * The role required to access the method/class.
     * Note: This is a placeholder - use @RequiresAdmin or @RequiresUser for
     * specific roles,
     * or use @PreAuthorize directly for custom expressions.
     */
    String value() default "ADMIN";
}
