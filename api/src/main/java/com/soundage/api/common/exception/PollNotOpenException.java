package com.soundage.api.common.exception;

import java.util.UUID;

public class PollNotOpenException extends RuntimeException {

    public PollNotOpenException(UUID pollId) {
        super("Poll is not open for voting: " + pollId);
    }

    public PollNotOpenException(String message) {
        super(message);
    }
}
