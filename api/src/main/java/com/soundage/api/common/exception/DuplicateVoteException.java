package com.soundage.api.common.exception;

public class DuplicateVoteException extends RuntimeException {

    public DuplicateVoteException() {
        super("You have already voted on this poll");
    }
}
