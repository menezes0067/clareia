package com.clareia.backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum AppointmentType {
    EVALUATION("evaluation", 30),
    CLEANING("cleaning", 45),
    RETURN("return", 30),
    ROOT_CANAL("root_canal", 90),
    ORTHODONTICS("orthodontics", 60),
    IMPLANT("implant", 120),
    WHITENING("whitening", 60),
    URGENCY("urgency", 30);

    private final String value;
    private final int defaultDurationMinutes;

    AppointmentType(String value, int defaultDurationMinutes) {
        this.value = value;
        this.defaultDurationMinutes = defaultDurationMinutes;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public int getDefaultDurationMinutes() {
        return defaultDurationMinutes;
    }

    @JsonCreator
    public static AppointmentType fromValue(String raw) {
        if (raw == null) return null;
        return Arrays.stream(values())
                .filter(e -> e.value.equalsIgnoreCase(raw.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de consulta inválido: " + raw));
    }
}
