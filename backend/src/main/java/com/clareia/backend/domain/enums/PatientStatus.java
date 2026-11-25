package com.clareia.backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum PatientStatus {
    ACTIVE("active"),
    ARCHIVED("archived");

    private final String value;

    PatientStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PatientStatus fromValue(String raw) {
        if (raw == null) return null;
        return Arrays.stream(values())
                .filter(e -> e.value.equalsIgnoreCase(raw.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Status de paciente inválido: " + raw));
    }
}
