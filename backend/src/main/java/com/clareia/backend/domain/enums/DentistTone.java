package com.clareia.backend.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.List;

public enum DentistTone {
    TEAL("teal"),
    SKY("sky"),
    MINT("mint"),
    SAND("sand"),
    ROSE("rose");

    private static final List<DentistTone> ROTATION = List.of(SKY, MINT, SAND, ROSE, TEAL);

    private final String value;

    DentistTone(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static DentistTone forIndex(int existingDentistCount) {
        return ROTATION.get(Math.floorMod(existingDentistCount, ROTATION.size()));
    }

    @JsonCreator
    public static DentistTone fromValue(String raw) {
        if (raw == null) return null;
        return Arrays.stream(values())
                .filter(e -> e.value.equalsIgnoreCase(raw.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tom de avatar inválido: " + raw));
    }
}
