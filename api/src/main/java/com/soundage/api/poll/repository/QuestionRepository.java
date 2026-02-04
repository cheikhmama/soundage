package com.soundage.api.poll.repository;

import com.soundage.api.poll.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByPollIdOrderBySortOrder(UUID pollId);
}
