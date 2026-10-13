class NotFoundError(Exception):
    """Raised when a requested entity doesn't exist."""
    pass


class BusinessError(Exception):
    """Raised for business-rule violations, e.g. duplicate email, booking conflicts."""
    pass


class AuthError(Exception):
    """Raised for authentication failures (bad credentials, duplicate username, etc)."""
    pass
