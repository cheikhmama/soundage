package com.soundage.api.poll.dto;

import com.soundage.api.poll.entity.Option;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionDto {

    private UUID id;
    private String type;
    private String textContent;
    private String imageUrl;
    private BigDecimal numericValue;
    private Integer sortOrder;
    private BigDecimal weight;

    public static OptionDto fromEntity(Option o) {
        if (o == null)
            return null;
        return OptionDto.builder()
                .id(o.getId())
                .type(o.getType() != null ? o.getType().name() : null)
                .textContent(o.getTextContent())
                .imageUrl(o.getImageUrl())
                .numericValue(o.getNumericValue())
                .sortOrder(o.getSortOrder())
                .weight(o.getWeight())
                .build();
    }
}
