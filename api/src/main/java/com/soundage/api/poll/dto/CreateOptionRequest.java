package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Option;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOptionRequest {

    @NotNull(message = "Option type is required")
    private Option.OptionType type;

    private String textContent;
    private String imageUrl;
    private BigDecimal numericValue;

    @Builder.Default
    private Integer sortOrder = 0;

    private BigDecimal weight;
}
