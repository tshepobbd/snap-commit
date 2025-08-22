import { ValidationError } from "../errors/CustomError.js";

export class Validator {
  static validatePositiveInteger(value, fieldName) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive integer`);
    }
    return num;
  }

  static validateString(value, fieldName, minLength = 1) {
    if (
      !value ||
      typeof value !== "string" ||
      value.trim().length < minLength
    ) {
      throw new ValidationError(`${fieldName} must be a non-empty string`);
    }
    return value.trim();
  }

  static validateBoolean(value, fieldName) {
    if (typeof value !== "boolean") {
      throw new ValidationError(`${fieldName} must be a boolean`);
    }
    return value;
  }

  static validateRange(value, fieldName, min, max) {
    const num = parseFloat(value);
    if (isNaN(num) || num < min || num > max) {
      throw new ValidationError(
        `${fieldName} must be between ${min} and ${max}`
      );
    }
    return num;
  }

  static validateEnum(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${allowedValues.join(", ")}`
      );
    }
    return value;
  }

  static validateDiff(diff) {
    return this.validateString(diff, "Diff", 1);
  }

  static validateCommitMessage(message) {
    return this.validateString(message, "Commit message", 1);
  }
}

export default Validator;
