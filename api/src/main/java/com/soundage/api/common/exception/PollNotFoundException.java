package com.soundage.api.common.exception;

import java.util.UUID;

public class PollNotFoundException extends RuntimeException {

    public PollNotFoundException(UUID id) {
        super("Poll not found: " + id);
    }
}
