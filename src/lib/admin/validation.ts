export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const digitsOnlyPhone = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 10);
};

export const validatePhone10Required = (phone: string): string | null => {
    const digits = digitsOnlyPhone(phone);
    if (!digits) return 'Phone number is required';
    if (digits.length !== 10) return 'Phone must be exactly 10 digits';
    return null;
};

export const validatePhone10Optional = (phone: string): string | null => {
    if (!phone) return null;
    const digits = digitsOnlyPhone(phone);
    if (digits.length !== 0 && digits.length !== 10) return 'Phone must be exactly 10 digits';
    return null;
};

export const requireMinLen10 = (value: string, fieldName: string): string | null => {
    if (!value || value.trim().length < 10) {
        return `${fieldName} must be at least 10 characters`;
    }
    return null;
};

export const minLen10IfPresent = (value: string, fieldName: string): string | null => {
    if (value && value.trim().length > 0 && value.trim().length < 10) {
        return `${fieldName} must be at least 10 characters if provided`;
    }
    return null;
};

export const validatePositiveNumber = (value: string, fieldName: string): string | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} must be greater than 0`;
    }
    return null;
};

export const validatePositiveInt = (value: string, fieldName: string): string | null => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} must be greater than 0`;
    }
    return null;
};

export const localTodayISODate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const validateDateNotPast = (dateStr: string, fieldName: string): string | null => {
    if (!dateStr) return `${fieldName} is required`;
    const inputDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
        return `${fieldName} cannot be in the past`;
    }
    return null;
};

export const validateReturnOnOrAfterDeparture = (
    departure: string,
    returnDate: string
): string | null => {
    if (!departure || !returnDate) return null;
    const dep = new Date(departure);
    const ret = new Date(returnDate);
    if (ret < dep) {
        return 'Return date must be on or after departure date';
    }
    return null;
};