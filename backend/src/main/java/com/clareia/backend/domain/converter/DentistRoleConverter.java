package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.DentistRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DentistRoleConverter implements AttributeConverter<DentistRole, String> {
    @Override
    public String convertToDatabaseColumn(DentistRole attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public DentistRole convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DentistRole.fromValue(dbData);
    }
}
