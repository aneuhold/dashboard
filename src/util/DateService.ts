/**
 * A class that supports converting dates across the application.
 *
 * This is a prime candidate for movement to a personal frontend library.
 */
export default class DateService {
  private static dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  private static dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  /**
   * Gets the date in date format if it is set to midnight, otherwise gets the
   * date in date time format.
   */
  static getAutoDateString(date: Date) {
    if (this.dateHasTime(date)) {
      return this.getDateTimeString(date);
    }
    return this.getDateString(date);
  }

  /**
   * Determines if a date has a user-specified time component to it.
   */
  static dateHasTime(date: Date) {
    return !this.dateIsMidnight(date);
  }

  static getDateString(date: Date) {
    return this.dateFormatter.format(date);
  }

  static getDateTimeString(date: Date) {
    return this.dateTimeFormatter.format(date);
  }

  private static dateIsMidnight(date: Date) {
    return (
      (date.getHours() === 0 && date.getMinutes() === 0) ||
      (date.getHours() === 23 && date.getMinutes() === 59)
    );
  }
}
