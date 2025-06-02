class AppException(Exception):
    status_code: int = 500
    message: str = "Internal error"

    def __init__(self, message: str = None):
        if message:
            self.message = message

class ObjectNotFoundError(AppException):
    status_code = 404
    message = "Object not found"

class ObjectAlreadyExistsError(AppException):
    status_code = 409
    message = "Object already exists"

class AccessDeniedError(AppException):
    status_code = 403
    message = "Access denied"