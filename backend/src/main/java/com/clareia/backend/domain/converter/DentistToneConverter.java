package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.DentistTone;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DentistToneConverter implements AttributeConverter<DentistTone, String> {
    @Override
    public String convertToDatabaseColumn(DentistTone attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public DentistTone convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DentistTone.fromValue(dbData);
    }
}
