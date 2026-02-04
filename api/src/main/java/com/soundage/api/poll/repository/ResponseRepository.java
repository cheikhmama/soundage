package com.soundage.api.poll.repository;

import com.soundage.api.poll.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResponseRepository extends JpaRepository<Response, UUID> {

    @Query("SELECT r FROM Response r WHERE r.poll.id = :pollId AND r.user.id = :userId")
    Optional<Response> findByPollIdAndUserId(@Param("pollId") UUID pollId, @Param("userId") UUID userId);

    @Query("SELECT r FROM Response r WHERE r.poll.id = :pollId AND r.anonymousId = :anonymousId")
    Optional<Response> findByPollIdAndAnonymousId(@Param("pollId") UUID pollId,
            @Param("anonymousId") String anonymousId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Response r WHERE r.poll.id = :pollId AND r.user.id = :userId")
    boolean existsByPollIdAndUserId(@Param("pollId") UUID pollId, @Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Response r WHERE r.poll.id = :pollId AND r.anonymousId = :anonymousId")
    boolean existsByPollIdAndAnonymousId(@Param("pollId") UUID pollId, @Param("anonymousId") String anonymousId);

    @Query("SELECT r FROM Response r WHERE r.poll.id = :pollId")
    List<Response> findByPollId(@Param("pollId") UUID pollId);
}
