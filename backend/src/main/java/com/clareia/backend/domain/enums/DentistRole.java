package com.clareia.backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum DentistRole {
    OWNER("owner"),
    DENTIST("dentist");

    private final String value;

    DentistRole(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DentistRole fromValue(String raw) {
        if (raw == null) return null;
        return Arrays.stream(values())
                .filter(e -> e.value.equalsIgnoreCase(raw.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Perfil de dentista inválido: " + raw));
    }
}
