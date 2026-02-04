package com.soundage.api.poll.repository;

import com.soundage.api.poll.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollRepository extends JpaRepository<Poll, UUID>, JpaSpecificationExecutor<Poll> {

        java.util.List<Poll> findByCreatedById(UUID createdById);

        java.util.List<Poll> findByIsActiveTrue();

        /**
         * Load poll with questions in one query to avoid lazy-load issues in results.
         */
        @Query("SELECT DISTINCT p FROM Poll p LEFT JOIN FETCH p.questions WHERE p.id = :id")
        Optional<Poll> findByIdWithQuestions(@Param("id") UUID id);
}
