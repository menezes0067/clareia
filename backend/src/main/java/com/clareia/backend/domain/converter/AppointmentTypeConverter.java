package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.AppointmentType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AppointmentTypeConverter implements AttributeConverter<AppointmentType, String> {
    @Override
    public String convertToDatabaseColumn(AppointmentType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public AppointmentType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : AppointmentType.fromValue(dbData);
    }
}
