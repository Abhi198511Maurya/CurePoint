class CustomError extends Error {
  constructor(status, message) {
    super(message, status);
    this.status = status;
  }
}

export default CustomError;
