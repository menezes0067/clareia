package com.clareia.backend.domain.converter;

import com.clareia.backend.domain.enums.AppointmentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AppointmentStatusConverter implements AttributeConverter<AppointmentStatus, String> {
    @Override
    public String convertToDatabaseColumn(AppointmentStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public AppointmentStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : AppointmentStatus.fromValue(dbData);
    }
}
