package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.DentistStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DentistStatusConverter implements AttributeConverter<DentistStatus, String> {
    @Override
    public String convertToDatabaseColumn(DentistStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public DentistStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DentistStatus.fromValue(dbData);
    }
}
