package com.soundage.api.poll.repository;

import com.soundage.api.poll.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OptionRepository extends JpaRepository<Option, UUID> {

    List<Option> findByQuestionIdOrderBySortOrder(UUID questionId);
}
