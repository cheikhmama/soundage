package com.soundage.api.poll.service;

import com.soundage.api.common.exception.AuthenticationRequiredForVoteException;
import com.soundage.api.common.exception.PollNotFoundException;
import com.soundage.api.common.exception.PollNotOpenException;
import com.soundage.api.poll.dto.*;
import com.soundage.api.poll.entity.*;
import com.soundage.api.poll.repository.OptionRepository;
import com.soundage.api.poll.repository.PollRepository;
import com.soundage.api.poll.repository.ResponseRepository;
import com.soundage.api.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final PollRepository pollRepository;
    private final ResponseRepository responseRepository;
    private final OptionRepository optionRepository;

    @Transactional
    public SubmitVoteResponse submitResponse(UUID pollId, SubmitVoteRequest request,
            Optional<User> currentUser, String clientIp) {
        try {
            return submitResponseOnce(pollId, request, currentUser, clientIp);
        } catch (DataIntegrityViolationException e) {
            // Race: two requests created the same voter; retry once to update existing
            return submitResponseOnce(pollId, request, currentUser, clientIp);
        }
    }

    @Transactional
    protected SubmitVoteResponse submitResponseOnce(UUID pollId, SubmitVoteRequest request,
            Optional<User> currentUser, String clientIp) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new PollNotFoundException(pollId));

        Instant now = Instant.now();
        if (!Boolean.TRUE.equals(poll.getIsActive())) {
            throw new PollNotOpenException("Poll is not active.");
        }
        if (poll.getStartsAt() != null && poll.getStartsAt().isAfter(now)) {
            throw new PollNotOpenException("Poll has not started yet.");
        }
        if (poll.getEndsAt() != null && poll.getEndsAt().isBefore(now)) {
            throw new PollNotOpenException("Poll has ended.");
        }

        boolean allowAnonymous = isAllowAnonymous(poll);
        UUID userId = currentUser.map(User::getId).orElse(null);
        String anonymousId = request.getAnonymousId();

        if (allowAnonymous) {
            if (userId == null && (anonymousId == null || anonymousId.isBlank())) {
                throw new PollNotOpenException("Anonymous vote requires an anonymousId (e.g. session id).");
            }
        } else {
            if (userId == null) {
                throw new AuthenticationRequiredForVoteException();
            }
        }

        Map<UUID, Question> questionMap = new HashMap<>();
        for (Question q : poll.getQuestions()) {
            questionMap.put(q.getId(), q);
        }

        Optional<Response> existingResponse = userId != null
                ? responseRepository.findByPollIdAndUserId(pollId, userId)
                : responseRepository.findByPollIdAndAnonymousId(pollId, anonymousId);

        Response response;
        boolean isUpdate;

        if (existingResponse.isPresent()) {
            response = existingResponse.get();
            response.getAnswers().clear();
            isUpdate = true;
        } else {
            response = Response.builder()
                    .poll(poll)
                    .user(userId != null ? currentUser.get() : null)
                    .anonymousId(userId == null ? anonymousId : null)
                    .ipAddress(clientIp)
                    .build();
            response = responseRepository.save(response);
            isUpdate = false;
        }

        for (AnswerInputDto input : request.getAnswers()) {
            Question question = questionMap.get(input.getQuestionId());
            if (question == null) {
                throw new IllegalArgumentException("Unknown question ID: " + input.getQuestionId());
            }

            if (input.getOptionId() != null) {
                Answer a = Answer.builder()
                        .response(response)
                        .question(question)
                        .option(optionRepository.findById(input.getOptionId()).orElse(null))
                        .build();
                response.getAnswers().add(a);
            }
            if (input.getOptionIds() != null) {
                for (UUID optId : input.getOptionIds()) {
                    Answer a = Answer.builder()
                            .response(response)
                            .question(question)
                            .option(optionRepository.findById(optId).orElse(null))
                            .build();
                    response.getAnswers().add(a);
                }
            }
            if (input.getTextValue() != null && !input.getTextValue().isBlank()) {
                Answer a = Answer.builder()
                        .response(response)
                        .question(question)
                        .textValue(input.getTextValue())
                        .build();
                response.getAnswers().add(a);
            }
            if (input.getNumericValue() != null) {
                Answer a = Answer.builder()
                        .response(response)
                        .question(question)
                        .numericValue(input.getNumericValue())
                        .build();
                response.getAnswers().add(a);
            }
            if (input.getRanking() != null) {
                for (RankingEntryDto entry : input.getRanking()) {
                    Answer a = Answer.builder()
                            .response(response)
                            .question(question)
                            .option(entry.getOptionId() != null
                                    ? optionRepository.findById(entry.getOptionId()).orElse(null)
                                    : null)
                            .position(entry.getPosition())
                            .build();
                    response.getAnswers().add(a);
                }
            }
        }

        responseRepository.save(response);

        String message = isUpdate ? "Your vote has been updated." : "Vote submitted successfully.";
        return SubmitVoteResponse.builder()
                .responseId(response.getId())
                .message(message)
                .build();
    }

    private boolean isAllowAnonymous(Poll poll) {
        if (poll.getSettings() == null)
            return true;
        Object v = poll.getSettings().get("allowAnonymous");
        return v instanceof Boolean && (Boolean) v;
    }
}
