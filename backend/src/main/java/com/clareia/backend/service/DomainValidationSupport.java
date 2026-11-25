package com.clareia.backend.service;

import com.clareia.backend.config.ClareiaProperties;
import com.clareia.backend.domain.util.DocumentValidator;
import com.clareia.backend.domain.util.Formatters;
import com.clareia.backend.web.error.ApiException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class DomainValidationSupport {

    private static final Pattern SIMPLE_EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final ClareiaProperties properties;

    public DomainValidationSupport(ClareiaProperties properties) {
        this.properties = properties;
    }

    public String requireName(String raw, String field, Map<String, String> errors) {
        String normalized = Formatters.normalizeName(raw);
        if (normalized.length() < 3) {
            errors.put(field, "Informe o nome completo.");
        } else if (normalized.length() > 80) {
            errors.put(field, "Nome muito longo.");
        }
        return normalized;
    }

    public String requireClinicName(String raw, String field, Map<String, String> errors) {
        String normalized = Formatters.normalizeName(raw);
        if (normalized.length() < 3) {
            errors.put(field, "Informe o nome da clínica.");
        } else if (normalized.length() > 80) {
            errors.put(field, "Nome da clínica muito longo.");
        }
        return normalized;
    }

    public String requireAddress(String raw, String field, Map<String, String> errors) {
        String trimmed = raw == null ? "" : raw.trim();
        if (trimmed.length() < 5) {
            errors.put(field, "Informe o endereço.");
        } else if (trimmed.length() > 255) {
            errors.put(field, "Endereço muito longo.");
        }
        return trimmed;
    }

    public String requireEmail(String raw, String field, Map<String, String> errors) {
        String normalized = Formatters.normalizeEmail(raw);
        if (normalized.isEmpty() || normalized.length() > 160 || !SIMPLE_EMAIL.matcher(normalized).matches()) {
            errors.put(field, "Informe um e-mail válido.");
        }
        return normalized;
    }

    public String requirePhone(String raw, String field, Map<String, String> errors) {
        if (!Formatters.isValidPhone(raw)) {
            errors.put(field, "Informe um telefone válido com DDD.");
            return "";
        }
        return Formatters.formatPhone(raw);
    }

    public String requireCnpj(String raw, String field, Map<String, String> errors) {
        if (!DocumentValidator.isValidCnpj(raw)) {
            errors.put(field, "Informe um CNPJ válido.");
            return "";
        }
        return Formatters.formatCnpj(raw);
    }

    public String requireCro(String raw, String field, Map<String, String> errors) {
        if (!Formatters.isValidCro(raw)) {
            errors.put(field, "Use o formato CRO-UF 12.345.");
            return "";
        }
        return Formatters.formatCro(raw);
    }

    public String requireSpecialty(String raw, String field, Map<String, String> errors) {
        String trimmed = raw == null ? "" : raw.trim();
        if (trimmed.length() < 2) {
            errors.put(field, "Informe a especialidade.");
        } else if (trimmed.length() > 120) {
            errors.put(field, "Especialidade muito longa.");
        }
        return trimmed;
    }

    public String optionalBio(String raw, String field, Map<String, String> errors) {
        String normalized = Formatters.normalizeOptionalText(raw);
        if (normalized != null && normalized.length() > 400) {
            errors.put(field, "Use até 400 caracteres.");
        }
        return normalized;
    }

    public LocalDate requireIsoDate(String raw, String field, Map<String, String> errors) {
        if (raw == null || !raw.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            errors.put(field, "Data inválida.");
            return null;
        }
        try {
            return LocalDate.parse(raw);
        } catch (DateTimeParseException ex) {
            errors.put(field, "Data inválida.");
            return null;
        }
    }

    public String requireStartTime(String raw, String field, Map<String, String> errors) {
        if (!Formatters.isValidTime24h(raw)) {
            errors.put(field, "Escolha um horário.");
            return "";
        }
        return raw.trim();
    }

    public String resolveNewAccountPassword(String provided, String field, Map<String, String> errors) {
        if (provided != null && !provided.isBlank()) {
            if (provided.length() < 6) {
                errors.put(field, "A senha deve ter pelo menos 6 caracteres.");
            }
            return provided;
        }
        if (properties.demo() != null
                && properties.demo().enabled()
                && properties.demo().defaultPassword() != null
                && !properties.demo().defaultPassword().isBlank()) {
            return properties.demo().defaultPassword();
        }
        errors.put(field, "Informe uma senha com pelo menos 6 caracteres.");
        return "";
    }

    public void throwIfErrors(Map<String, String> errors) {
        if (!errors.isEmpty()) {
            throw ApiException.fieldValidation(errors);
        }
    }
}
