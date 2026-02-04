package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Question;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {

    @NotNull(message = "Question type is required")
    private Question.QuestionType type;

    @NotBlank(message = "Question title is required")
    private String title;

    @Builder.Default
    private Boolean isRequired = true;

    @Builder.Default
    private Boolean allowMultiple = false;

    @Builder.Default
    private Integer sortOrder = 0;

    private Map<String, Object> settings;

    @Valid
    private List<CreateOptionRequest> options;
}
