package com.soundage.api.poll.service;

import com.soundage.api.common.exception.PollNotFoundException;
import com.soundage.api.poll.dto.*;
import com.soundage.api.poll.entity.Answer;
import com.soundage.api.poll.entity.Option;
import com.soundage.api.poll.entity.Poll;
import com.soundage.api.poll.entity.Question;
import com.soundage.api.poll.repository.AnswerRepository;
import com.soundage.api.poll.repository.PollRepository;
import com.soundage.api.poll.repository.ResponseRepository;
import com.soundage.api.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;
    private final ResponseRepository responseRepository;
    private final AnswerRepository answerRepository;

    @Transactional(readOnly = true)
    public List<PollDto> findAllActive() {
        Instant now = Instant.now();
        return pollRepository.findByIsActiveTrue().stream()
                .filter(p -> (p.getStartsAt() == null || !p.getStartsAt().isAfter(now))
                        && (p.getEndsAt() == null || !p.getEndsAt().isBefore(now)))
                .map(PollDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PollDto> findAllForAdmin(String search, Boolean active, Instant startFrom, Instant endBy) {
        Specification<Poll> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), term),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), term)));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("isActive"), active));
            }
            if (startFrom != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("startsAt")),
                        cb.greaterThanOrEqualTo(root.get("startsAt"), startFrom)));
            }
            if (endBy != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("endsAt")),
                        cb.lessThanOrEqualTo(root.get("endsAt"), endBy)));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
        return pollRepository.findAll(spec).stream()
                .map(PollDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PollDetailDto findByIdWithQuestions(UUID id) {
        return findByIdWithQuestions(id, Optional.empty(), Optional.empty());
    }

    @Transactional(readOnly = true)
    public PollDetailDto findByIdWithQuestions(UUID id, Optional<User> currentUser, Optional<String> anonymousId) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new PollNotFoundException(id));
        PollDetailDto dto = PollDetailDto.fromEntity(poll);
        boolean hasVoted = currentUser.map(u -> responseRepository.existsByPollIdAndUserId(id, u.getId()))
                .orElse(anonymousId.filter(s -> s != null && !s.isBlank())
                        .map(s -> responseRepository.existsByPollIdAndAnonymousId(id, s))
                        .orElse(false));
        dto.setHasVoted(hasVoted);
        return dto;
    }

    @Transactional(readOnly = true)
    public PollDetailDto findByIdForAdmin(UUID id) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new PollNotFoundException(id));
        return PollDetailDto.fromEntity(poll);
    }

    @Transactional
    public PollDetailDto create(CreatePollRequest req, User createdBy) {
        Map<String, Object> settings = req.getSettings() != null ? new HashMap<>(req.getSettings()) : new HashMap<>();
        settings.put("allowAnonymous", req.getAllowAnonymous() != null ? req.getAllowAnonymous() : true);

        Poll poll = Poll.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .startsAt(req.getStartsAt())
                .endsAt(req.getEndsAt())
                .createdBy(createdBy)
                .settings(settings)
                .build();

        if (req.getQuestions() != null) {
            int so = 0;
            for (CreateQuestionRequest qReq : req.getQuestions()) {
                Question q = toQuestion(poll, qReq, so++);
                poll.getQuestions().add(q);
            }
        }

        poll = pollRepository.save(poll);
        return PollDetailDto.fromEntity(poll);
    }

    @Transactional
    public PollDetailDto update(UUID id, UpdatePollRequest req, User admin) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new PollNotFoundException(id));

        if (req.getTitle() != null)
            poll.setTitle(req.getTitle());
        if (req.getDescription() != null)
            poll.setDescription(req.getDescription());
        if (req.getIsActive() != null)
            poll.setIsActive(req.getIsActive());
        if (req.getStartsAt() != null)
            poll.setStartsAt(req.getStartsAt());
        if (req.getEndsAt() != null)
            poll.setEndsAt(req.getEndsAt());
        if (req.getSettings() != null)
            poll.setSettings(req.getSettings());
        if (req.getAllowAnonymous() != null) {
            Map<String, Object> settings = poll.getSettings() != null ? new HashMap<>(poll.getSettings())
                    : new HashMap<>();
            settings.put("allowAnonymous", req.getAllowAnonymous());
            poll.setSettings(settings);
        }

        long responseCount = responseRepository.findByPollId(id).size();
        if (req.getQuestions() != null && responseCount == 0) {
            poll.getQuestions().clear();
            int so = 0;
            for (CreateQuestionRequest qReq : req.getQuestions()) {
                Question q = toQuestion(poll, qReq, so++);
                poll.getQuestions().add(q);
            }
        }

        poll = pollRepository.save(poll);
        return PollDetailDto.fromEntity(poll);
    }

    @Transactional
    public void delete(UUID id) {
        if (!pollRepository.existsById(id)) {
            throw new PollNotFoundException(id);
        }
        pollRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PollResultsDto findResults(UUID pollId) {
        Poll poll = pollRepository.findByIdWithQuestions(pollId)
                .orElseThrow(() -> new PollNotFoundException(pollId));
        List<Question> questions = poll.getQuestions() != null ? poll.getQuestions() : List.of();
        // Force load options (and their imageUrl) for each question so results include
        // images
        for (Question q : questions) {
            if (q.getOptions() != null) {
                for (Option opt : q.getOptions()) {
                    opt.getImageUrl();
                }
            }
        }

        List<com.soundage.api.poll.entity.Response> responses = responseRepository.findByPollId(pollId);
        long totalResponses = responses.size();

        List<Answer> answers = new ArrayList<>();
        for (com.soundage.api.poll.entity.Response r : responses) {
            answers.addAll(answerRepository.findByResponseId(r.getId()));
        }

        Map<UUID, List<Answer>> answersByQuestion = answers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getId()));

        List<QuestionResultDto> questionResults = new ArrayList<>();
        for (Question q : questions) {
            List<Answer> qAnswers = answersByQuestion.getOrDefault(q.getId(), List.of());
            QuestionResultDto dto = buildQuestionResult(q, qAnswers, totalResponses);
            questionResults.add(dto);
        }

        List<VoterInfoDto> voters = responses.stream()
                .map(this::toVoterInfo)
                .collect(Collectors.toList());

        return PollResultsDto.builder()
                .pollId(poll.getId())
                .pollTitle(poll.getTitle())
                .totalResponses(totalResponses)
                .questionResults(questionResults)
                .voters(voters)
                .build();
    }

    private VoterInfoDto toVoterInfo(com.soundage.api.poll.entity.Response r) {
        if (r.getUser() != null) {
            String name = (r.getUser().getName() != null ? r.getUser().getName() : "")
                    + (r.getUser().getLastName() != null ? " " + r.getUser().getLastName() : "").trim();
            if (name.isBlank())
                name = r.getUser().getEmail();
            return VoterInfoDto.builder()
                    .displayName(name)
                    .email(r.getUser().getEmail())
                    .anonymous(false)
                    .build();
        }
        return VoterInfoDto.builder()
                .displayName("Anonymous")
                .email(null)
                .anonymous(true)
                .build();
    }

    private QuestionResultDto buildQuestionResult(Question q, List<Answer> qAnswers, long totalResponses) {
        String type = q.getType().name();
        QuestionResultDto.QuestionResultDtoBuilder b = QuestionResultDto.builder()
                .questionId(q.getId())
                .questionTitle(q.getTitle())
                .type(type);

        if (q.getType() == Question.QuestionType.single_choice || q.getType() == Question.QuestionType.yes_no
                || q.getType() == Question.QuestionType.multiple_choice
                || q.getType() == Question.QuestionType.image_choice) {
            Map<UUID, Long> countByOption = new HashMap<>();
            List<Option> options = q.getOptions() != null ? q.getOptions() : List.of();
            for (Option opt : options) {
                countByOption.put(opt.getId(), 0L);
            }
            for (Answer a : qAnswers) {
                if (a.getOption() != null) {
                    countByOption.merge(a.getOption().getId(), 1L, Long::sum);
                }
            }
            long totalSelections = qAnswers.size();
            if (totalSelections == 0)
                totalSelections = 1;
            List<OptionCountDto> optionCounts = new ArrayList<>();
            for (Option opt : options) {
                long count = countByOption.getOrDefault(opt.getId(), 0L);
                double pct = totalResponses > 0 ? 100.0 * count / totalResponses : 0;
                optionCounts.add(OptionCountDto.builder()
                        .optionId(opt.getId())
                        .optionLabel(opt.getTextContent() != null ? opt.getTextContent() : opt.getId().toString())
                        .imageUrl(opt.getImageUrl())
                        .count(count)
                        .percentage(Math.round(pct * 10) / 10.0)
                        .build());
            }
            optionCounts.sort((x, y) -> Long.compare(y.getCount(), x.getCount()));
            b.optionCounts(optionCounts);
        } else if (q.getType() == Question.QuestionType.rating) {
            long[] buckets = new long[6];
            double sum = 0;
            int n = 0;
            for (Answer a : qAnswers) {
                if (a.getNumericValue() != null) {
                    int v = a.getNumericValue().intValue();
                    if (v >= 1 && v <= 5) {
                        buckets[v]++;
                        sum += v;
                        n++;
                    }
                }
            }
            List<RatingBucketDto> ratingDistribution = new ArrayList<>();
            long total = Arrays.stream(buckets).sum();
            if (total == 0)
                total = 1;
            for (int v = 1; v <= 5; v++) {
                double pct = 100.0 * buckets[v] / total;
                ratingDistribution.add(RatingBucketDto.builder()
                        .value(v)
                        .count(buckets[v])
                        .percentage(Math.round(pct * 10) / 10.0)
                        .build());
            }
            b.ratingDistribution(ratingDistribution);
            b.averageRating(n > 0 ? Math.round(sum / n * 10) / 10.0 : null);
        } else if (q.getType() == Question.QuestionType.text) {
            List<String> texts = qAnswers.stream()
                    .map(Answer::getTextValue)
                    .filter(Objects::nonNull)
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.toList());
            b.textResponses(texts);
            List<TextResponseEntryDto> entries = new ArrayList<>();
            for (Answer a : qAnswers) {
                if (a.getTextValue() == null || a.getTextValue().isBlank())
                    continue;
                com.soundage.api.poll.entity.Response resp = a.getResponse();
                String displayName = "Anonymous";
                String email = null;
                boolean anonymous = true;
                if (resp != null && resp.getUser() != null) {
                    displayName = (resp.getUser().getName() != null ? resp.getUser().getName() : "")
                            + (resp.getUser().getLastName() != null ? " " + resp.getUser().getLastName() : "").trim();
                    if (displayName.isBlank())
                        displayName = resp.getUser().getEmail();
                    email = resp.getUser().getEmail();
                    anonymous = false;
                }
                entries.add(TextResponseEntryDto.builder()
                        .displayName(displayName)
                        .email(email)
                        .anonymous(anonymous)
                        .text(a.getTextValue())
                        .build());
            }
            b.textResponseEntries(entries);
        }

        return b.build();
    }

    private Question toQuestion(Poll poll, CreateQuestionRequest qReq, int sortOrder) {
        Question q = Question.builder()
                .poll(poll)
                .type(qReq.getType())
                .title(qReq.getTitle())
                .isRequired(qReq.getIsRequired() != null ? qReq.getIsRequired() : true)
                .allowMultiple(qReq.getAllowMultiple() != null ? qReq.getAllowMultiple() : false)
                .sortOrder(qReq.getSortOrder() != null ? qReq.getSortOrder() : sortOrder)
                .settings(qReq.getSettings())
                .build();

        if (qReq.getOptions() != null) {
            int oSo = 0;
            for (CreateOptionRequest oReq : qReq.getOptions()) {
                Option o = Option.builder()
                        .question(q)
                        .type(oReq.getType())
                        .textContent(oReq.getTextContent())
                        .imageUrl(oReq.getImageUrl())
                        .numericValue(oReq.getNumericValue())
                        .sortOrder(oReq.getSortOrder() != null ? oReq.getSortOrder() : oSo++)
                        .weight(oReq.getWeight())
                        .build();
                q.getOptions().add(o);
            }
        }
        return q;
    }
}
