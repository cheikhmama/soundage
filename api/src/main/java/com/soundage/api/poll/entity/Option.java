package com.soundage.api.poll.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "options")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private OptionType type;

    @Column(name = "text_content", length = 1000)
    private String textContent;

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @Column(name = "numeric_value", precision = 20, scale = 4)
    private BigDecimal numericValue;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(precision = 20, scale = 4)
    private BigDecimal weight;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();

    public enum OptionType {
        TEXT,
        IMAGE,
        NUMERIC
    }
}
