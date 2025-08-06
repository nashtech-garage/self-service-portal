export const calculateAge = (birthDate: Date, referenceDate: Date = new Date()): number => {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
};

export const isAtLeast18YearsOld = (birthDate: Date, referenceDate: Date = new Date()): boolean =>
  calculateAge(birthDate, referenceDate) >= 18;

export const isAtMost60YearsOld = (birthDate: Date, referenceDate: Date = new Date()): boolean =>
  calculateAge(birthDate, referenceDate) < 60;

export const formatDateWithoutTime = (date: Date | null | undefined): string => {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const newDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return newDate.toISOString();
};

export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00.000Z`;
};
export const createAdjustedDate = (inputDate: Date | string): Date => {
  const selectedDate = new Date(inputDate);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  return new Date(year, month, day, 0, 0, 0);
};
