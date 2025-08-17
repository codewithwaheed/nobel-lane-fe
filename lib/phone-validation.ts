// Utility functions for US phone number validation and formatting

/**
 * Validates if a phone number is a valid US/Canada number
 * @param phone - The phone number string to validate
 * @returns Object with validation result and formatted number
 */
export function validateUSPhoneNumber(phone: string): {
    isValid: boolean;
    isUSCanada: boolean;
    formatted: string;
    error?: string;
} {
    if (!phone || typeof phone !== "string") {
        return {
            isValid: false,
            isUSCanada: false,
            formatted: "",
            error: "Phone number is required",
        };
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Check for various US/Canada formats
    let isUSCanada = false;
    let formatted = "";

    if (cleanPhone.length === 10) {
        // 10-digit US number (e.g., 5551234567)
        if (!cleanPhone.startsWith("0") && !cleanPhone.startsWith("1")) {
            isUSCanada = true;
            formatted = `+1${cleanPhone}`;
        }
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
        // 11-digit with country code (e.g., 15551234567)
        isUSCanada = true;
        formatted = `+${cleanPhone}`;
    }

    // Additional validation for US number patterns
    if (isUSCanada) {
        const numberPart = cleanPhone.length === 10
            ? cleanPhone
            : cleanPhone.substring(1);
        const areaCode = numberPart.substring(0, 3);
        const exchange = numberPart.substring(3, 6);

        // Check for invalid area codes and exchanges
        if (
            areaCode.startsWith("0") || areaCode.startsWith("1") ||
            exchange.startsWith("0") || exchange.startsWith("1")
        ) {
            isUSCanada = false;
        }
    }

    return {
        isValid: cleanPhone.length >= 10 && /^\+?[\d\s\-\(\)]+$/.test(phone),
        isUSCanada,
        formatted,
        error: !isUSCanada && cleanPhone.length > 0
            ? "Please enter a valid US phone number. SMS notifications are only available for US numbers."
            : undefined,
    };
}

/**
 * Formats a phone number for display (e.g., (555) 123-4567)
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneForDisplay(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length === 10) {
        return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${
            cleanPhone.slice(6)
        }`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
        const number = cleanPhone.slice(1);
        return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${
            number.slice(6)
        }`;
    }

    return phone; // Return original if can't format
}

/**
 * Auto-formats phone number as user types
 * @param input - The input string from user
 * @returns Formatted string for input field
 */
export function formatPhoneInput(input: string): string {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, "");

    // Handle different input patterns
    if (cleaned.startsWith("+1")) {
        const digits = cleaned.substring(2);
        if (digits.length <= 3) return `+1 (${digits}`;
        if (digits.length <= 6) {
            return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        if (digits.length <= 10) {
            return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
                digits.slice(6)
            }`;
        }
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
            digits.slice(6, 10)
        }`;
    } else if (cleaned.startsWith("1") && cleaned.length > 1) {
        // Handle 1XXXXXXXXXX format
        const digits = cleaned.substring(1);
        if (digits.length <= 3) return `+1 (${digits}`;
        if (digits.length <= 6) {
            return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        if (digits.length <= 10) {
            return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
                digits.slice(6)
            }`;
        }
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
            digits.slice(6, 10)
        }`;
    } else {
        // Handle 10-digit format
        const digits = cleaned.replace(/^\+/, "");
        if (digits.length <= 3) return digits.length > 0 ? `(${digits}` : "";
        if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        if (digits.length <= 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
                digits.slice(6)
            }`;
        }
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${
            digits.slice(6, 10)
        }`;
    }
}
