package com.clareia.backend.domain.util;

import java.util.Locale;
import java.util.regex.Pattern;

public final class Formatters {

    private static final Pattern VALID_DDD_PREFIX = Pattern.compile("^[1-9]\\d");
    private static final Pattern TWO_UPPER_LETTERS = Pattern.compile("[A-Z]{2}");
    private static final Pattern TIME_24H = Pattern.compile("^([01]\\d|2[0-3]):[0-5]\\d$");

    private Formatters() {}

    public static String normalizeName(String raw) {
        if (raw == null) return "";
        return raw.trim().replaceAll("\\s+", " ");
    }

    public static String normalizeEmail(String raw) {
        if (raw == null) return "";
        return raw.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValidPhone(String raw) {
        if (raw == null) return false;
        String digits = raw.replaceAll("\\D", "");
        return (digits.length() == 10 || digits.length() == 11)
                && VALID_DDD_PREFIX.matcher(digits).find();
    }

    public static String formatPhone(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() > 11) {
            digits = digits.substring(0, 11);
        }
        if (digits.length() == 10) {
            return "(%s) %s-%s".formatted(
                    digits.substring(0, 2),
                    digits.substring(2, 6),
                    digits.substring(6)
            );
        }
        if (digits.length() == 11) {
            return "(%s) %s-%s".formatted(
                    digits.substring(0, 2),
                    digits.substring(2, 7),
                    digits.substring(7)
            );
        }
        return raw.trim();
    }

    public static String formatCnpj(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() != 14) return raw.trim();
        return "%s.%s.%s/%s-%s".formatted(
                digits.substring(0, 2),
                digits.substring(2, 5),
                digits.substring(5, 8),
                digits.substring(8, 12),
                digits.substring(12, 14)
        );
    }

    public static String formatCro(String raw) {
        if (raw == null) return "";
        return raw.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    public static boolean isValidCro(String raw) {
        if (raw == null) return false;
        String formatted = formatCro(raw);
        if (formatted.length() < 4 || formatted.length() > 24) return false;
        String digits = formatted.replaceAll("\\D", "");
        return TWO_UPPER_LETTERS.matcher(formatted).find() && digits.length() >= 4;
    }

    public static boolean isValidTime24h(String raw) {
        return raw != null && TIME_24H.matcher(raw.trim()).matches();
    }

    public static String normalizeOptionalText(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static String normalizeNotesRequired(String raw) {
        if (raw == null) return "";
        return raw.trim();
    }
}
