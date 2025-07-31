import { z } from "zod";
import { NAME_REGEX } from "../../constants/regex";
import { calculateAge, isAtLeast18YearsOld, isAtMost60YearsOld, isWeekend } from "../../utils/datetime";

export const dateOfBirthField = z
    .date()
    .refine((dob) => isAtLeast18YearsOld(dob), {
        message: "User is under 18. Please select a different date"
    })
    .refine((dob) => isAtMost60YearsOld(dob), {
        message: "User is over 60. Please select a different date"
    });

// Function to validate joined date - must not be a weekend and must be after the user turns 18
export const getJoinedDateField = (dateOfBirth?: Date) => {
    return z
        .date()
        .refine((joinedDate) => !isWeekend(joinedDate), {
            message: "Joined date is Saturday or Sunday. Please select a different date"
        })
        .refine((joinedDate) => {
            // Skip this check if dateOfBirth is not provided
            if (!dateOfBirth) return true;

            // Check if user is at least 18 years old when joining
            return isAtLeast18YearsOld(dateOfBirth, joinedDate);
        }, {
            message: "User is under 18. Please select a different date"
        });
};

export const getNameField = (nameType: 'firstName' | 'lastName') => {
    return z
        .string()
        .nonempty(`${nameType === 'firstName' ? 'First name' : 'Last name'} is required`)
        .max(50, `${nameType === 'firstName' ? 'First name' : 'Last name'} cannot exceed 50 characters`)
        .refine((name: string) => name === name.trim(), {
            message: `${nameType === 'firstName' ? 'First name' : 'Last name'} cannot start or end with spaces`
        })
        .transform((value: string) => value.trim())
        .refine((name: string) => name.length >= 2, {
            message: `${nameType === 'firstName' ? 'First name' : 'Last name'} must be at least 2 characters long`
        })
        .refine((name: string) => NAME_REGEX.test(name), {
            message: `${nameType === 'firstName' ? 'First name' : 'Last name'} can only contain English letters (A-Z, a-z), numbers, spaces, underscores and apostrophes`
        })
        .refine((name: string) => {
            // Check for forbidden words if needed
            const forbiddenWords = ['admin', 'test', 'system'];
            const lowerCaseName = name.toLowerCase();
            return !forbiddenWords.includes(lowerCaseName);
        }, {
            message: `${nameType === 'firstName' ? 'First name' : 'Last name'} cannot be 'admin', 'test', or 'system'`
        });
};

export const nameField = z
    .string()
    .nonempty("Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .refine((name: string) => name === name.trim(), {
        message: "Name cannot start or end with spaces"
    })
    .transform((value: string) => value.trim())
    .refine((name: string) => name.length >= 2, {
        message: "Name must be at least 2 characters long"
    })
    .refine((name: string) => NAME_REGEX.test(name), {
        message: "Name can only contain English letters (A-Z, a-z), numbers, spaces, underscores and apostrophes"
    })
    .refine((name: string) => {
        const forbiddenWords = ['admin', 'test', 'system'];
        const lowerCaseName = name.toLowerCase();
        return !forbiddenWords.includes(lowerCaseName);
    }, {
        message: "Name cannot be 'admin', 'test', or 'system'"
    });

export const genderField = z.enum(["Male", "Female"]); 