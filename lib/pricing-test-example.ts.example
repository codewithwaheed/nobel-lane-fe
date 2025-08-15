// Example usage of the Central Time Zone early/late pricing logic

import {
    detectEarlyLatePickup,
    getCentralTimeHour,
    PRICING_CONSTANTS,
} from "./pricing-logic";

// Test examples
console.log("Early/Late Pickup Detection with Central Time Zone:");
console.log("===============================================");

// Example 1: Early morning pickup (5 AM local time)
const earlyDate = "2024-01-15";
const earlyTime = "05:00";
const isEarly = detectEarlyLatePickup(earlyDate, earlyTime);
const earlyHour = getCentralTimeHour(earlyDate, earlyTime);
console.log(
    `${earlyDate} ${earlyTime} -> ${earlyHour}:00 CT -> Early/Late: ${isEarly} -> Fee: $${
        isEarly ? PRICING_CONSTANTS.EARLY_LATE_FEE : 0
    }`,
);

// Example 2: Late night pickup (11 PM local time)
const lateDate = "2024-01-15";
const lateTime = "23:00";
const isLate = detectEarlyLatePickup(lateDate, lateTime);
const lateHour = getCentralTimeHour(lateDate, lateTime);
console.log(
    `${lateDate} ${lateTime} -> ${lateHour}:00 CT -> Early/Late: ${isLate} -> Fee: $${
        isLate ? PRICING_CONSTANTS.EARLY_LATE_FEE : 0
    }`,
);

// Example 3: Normal business hours
const normalDate = "2024-01-15";
const normalTime = "14:00";
const isNormal = detectEarlyLatePickup(normalDate, normalTime);
const normalHour = getCentralTimeHour(normalDate, normalTime);
console.log(
    `${normalDate} ${normalTime} -> ${normalHour}:00 CT -> Early/Late: ${isNormal} -> Fee: $${
        isNormal ? PRICING_CONSTANTS.EARLY_LATE_FEE : 0
    }`,
);

// Example 4: Edge case - exactly 6 AM CT
const edgeDate = "2024-01-15";
const edgeTime = "06:00";
const isEdge = detectEarlyLatePickup(edgeDate, edgeTime);
const edgeHour = getCentralTimeHour(edgeDate, edgeTime);
console.log(
    `${edgeDate} ${edgeTime} -> ${edgeHour}:00 CT -> Early/Late: ${isEdge} -> Fee: $${
        isEdge ? PRICING_CONSTANTS.EARLY_LATE_FEE : 0
    }`,
);
