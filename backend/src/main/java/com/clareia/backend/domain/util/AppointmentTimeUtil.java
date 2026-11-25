package com.clareia.backend.domain.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

public final class AppointmentTimeUtil {

    private AppointmentTimeUtil() {}

    public static int timeToMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    public static String minutesToTime(int total) {
        int normalized = Math.floorMod(total, 1440);
        int hours = normalized / 60;
        int minutes = normalized % 60;
        return String.format("%02d:%02d", hours, minutes);
    }

    public static String endTimeOf(String startTime, int durationMinutes) {
        return minutesToTime(timeToMinutes(startTime) + durationMinutes);
    }

    public static boolean overlaps(
            LocalDate dateA, String startA, int durationA,
            LocalDate dateB, String startB, int durationB
    ) {
        if (!dateA.equals(dateB)) return false;
        int aStart = timeToMinutes(startA);
        int aEnd = aStart + durationA;
        int bStart = timeToMinutes(startB);
        int bEnd = bStart + durationB;
        return aStart < bEnd && bStart < aEnd;
    }

    public static Instant endInstant(LocalDate date, String startTime, int durationMinutes, ZoneId zoneId) {
        LocalTime start = LocalTime.parse(startTime);
        LocalDateTime end = LocalDateTime.of(date, start).plusMinutes(durationMinutes);
        return end.atZone(zoneId).toInstant();
    }
}
