package com.soundage.api.poll.repository;

import com.soundage.api.poll.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    List<Answer> findByResponseId(UUID responseId);

    List<Answer> findByQuestionId(UUID questionId);
}
