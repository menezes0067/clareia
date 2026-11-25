package com.clareia.backend.domain.util;

import java.util.regex.Pattern;

public final class DocumentValidator {

    private static final Pattern ALL_SAME_DIGITS = Pattern.compile("^(\\d)\\1{13}$");
    private static final int[] FIRST_WEIGHTS = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] SECOND_WEIGHTS = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private DocumentValidator() {}

    public static boolean isValidCnpj(String value) {
        if (value == null) return false;
        String digits = value.replaceAll("\\D", "");
        if (digits.length() != 14 || ALL_SAME_DIGITS.matcher(digits).matches()) {
            return false;
        }
        int[] numbers = new int[14];
        for (int i = 0; i < 14; i++) {
            numbers[i] = digits.charAt(i) - '0';
        }
        int first = checkDigit(numbers, FIRST_WEIGHTS);
        if (first != numbers[12]) return false;
        int second = checkDigit(numbers, SECOND_WEIGHTS);
        return second == numbers[13];
    }

    private static int checkDigit(int[] numbers, int[] weights) {
        int sum = 0;
        for (int i = 0; i < weights.length; i++) {
            sum += numbers[i] * weights[i];
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
