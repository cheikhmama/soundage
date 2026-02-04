package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {

    private UUID id;
    private String type;
    private String title;
    private Boolean isRequired;
    private Boolean allowMultiple;
    private Integer sortOrder;
    private Map<String, Object> settings;
    private List<OptionDto> options;

    public static QuestionDto fromEntity(Question q) {
        if (q == null)
            return null;
        List<OptionDto> options = q.getOptions() != null
                ? q.getOptions().stream().map(OptionDto::fromEntity).collect(Collectors.toList())
                : List.of();
        return QuestionDto.builder()
                .id(q.getId())
                .type(q.getType() != null ? q.getType().name() : null)
                .title(q.getTitle())
                .isRequired(q.getIsRequired())
                .allowMultiple(q.getAllowMultiple())
                .sortOrder(q.getSortOrder())
                .settings(q.getSettings())
                .options(options)
                .build();
    }
}
