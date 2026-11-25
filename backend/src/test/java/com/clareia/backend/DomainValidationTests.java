package com.clareia.backend;

import com.clareia.backend.domain.util.AppointmentTimeUtil;
import com.clareia.backend.domain.util.DocumentValidator;
import com.clareia.backend.domain.util.Formatters;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class DomainValidationTests {

    @Test
    void validatesCnpjCheckDigitsAndFormatting() {
        assertThat(DocumentValidator.isValidCnpj("12.345.678/0001-95")).isTrue();
        assertThat(DocumentValidator.isValidCnpj("12345678000195")).isTrue();
        assertThat(DocumentValidator.isValidCnpj("12.345.678/0001-96")).isFalse();
        assertThat(DocumentValidator.isValidCnpj("11.111.111/1111-11")).isFalse();
        assertThat(DocumentValidator.isValidCnpj("123")).isFalse();
        assertThat(Formatters.formatCnpj("12345678000195")).isEqualTo("12.345.678/0001-95");
    }

    @Test
    void validatesAndFormatsPhonesAndCro() {
        assertThat(Formatters.isValidPhone("(11) 3082-4410")).isTrue();
        assertThat(Formatters.isValidPhone("11998124401")).isTrue();
        assertThat(Formatters.isValidPhone("01998124401")).isFalse();
        assertThat(Formatters.isValidPhone("12345")).isFalse();

        assertThat(Formatters.formatPhone("1130824410")).isEqualTo("(11) 3082-4410");
        assertThat(Formatters.formatPhone("11998124401")).isEqualTo("(11) 99812-4401");

        assertThat(Formatters.isValidCro("cro-sp 48.210")).isTrue();
        assertThat(Formatters.formatCro("  cro-sp   48.210 ")).isEqualTo("CRO-SP 48.210");
        assertThat(Formatters.isValidCro("123")).isFalse();
    }

    @Test
    void detectsAppointmentOverlapsCorrectly() {
        LocalDate day = LocalDate.of(2026, 12, 1);
        assertThat(AppointmentTimeUtil.overlaps(day, "09:00", 60, day, "09:30", 30)).isTrue();
        assertThat(AppointmentTimeUtil.overlaps(day, "09:00", 30, day, "09:30", 30)).isFalse();
        assertThat(AppointmentTimeUtil.overlaps(day, "09:00", 60, day.plusDays(1), "09:00", 60)).isFalse();
        assertThat(AppointmentTimeUtil.endTimeOf("09:30", 45)).isEqualTo("10:15");
    }
}
