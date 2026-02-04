package com.soundage.api.common.exception;

public class AuthenticationRequiredForVoteException extends RuntimeException {

    public AuthenticationRequiredForVoteException() {
        super("This poll requires authentication to vote. Please sign in.");
    }
}
