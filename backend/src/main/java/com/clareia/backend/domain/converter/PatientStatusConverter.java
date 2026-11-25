package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.PatientStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PatientStatusConverter implements AttributeConverter<PatientStatus, String> {
    @Override
    public String convertToDatabaseColumn(PatientStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public PatientStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : PatientStatus.fromValue(dbData);
    }
}
