# Security Policy

## Scope

This is an educational/portfolio project demonstrating web security concepts including authentication, authorization, password hashing, and session management.

## Supported Versions

This project is not actively maintained for production use. It was created as a learning exercise during the Lighthouse Labs Web Development Bootcamp (March 2021).

## Reporting a Vulnerability

While this is a learning project, I appreciate security feedback and use it as an opportunity to improve my security knowledge:

- **Email:** violet@violetfigueroa.com
- **Response Time:** Best effort (typically 2-7 days)
- **Recognition:** Security findings will be acknowledged in this SECURITY.md file

## Security Features Implemented

This project demonstrates understanding of the following security concepts:

### Authentication & Password Security
- **bcrypt password hashing** with salt rounds (10+ rounds)
- **Timing-safe password comparison** using bcrypt.compare()
- **No plaintext password storage** - hashed values only
- **User enumeration protection** - generic error messages during login

### Session Management
- **Encrypted cookie-based sessions** using cookie-session middleware
- **Signed cookies** prevent client-side tampering
- **Configurable session expiration** (24-hour maxAge)
- **Proper session lifecycle** (creation, validation, destruction)

### Authorization & Access Control
- **User-specific resource access** - users can only view/edit/delete their own URLs
- **Authorization checks** on every sensitive endpoint
- **HTTP 401 Unauthorized** responses for access violations
- **Principle of least privilege** implementation

### Input Validation
- **URL validation** prevents empty or malformed submissions
- **Parameter validation** for route parameters
- **Proper HTTP status codes** (400, 401, 404)
- **Safe error messages** that don't expose system internals

## Known Limitations (Educational Context)

The following production-ready features are **intentionally excluded** as this is a learning project:

- **Rate limiting** for brute force protection
- **HTTPS enforcement** (assumed for production deployment)
- **CAPTCHA** for automated attack prevention
- **Multi-factor authentication**
- **Password complexity requirements**
- **Account lockout mechanisms**
- **Comprehensive audit logging**
- **CSRF token protection**
- **Database connection pooling** (uses in-memory data store)

## Security Mindset

This project was built with security consciousness even in an educational context. Key principles applied:

1. **Defense in depth** - Multiple layers of security controls
2. **Secure by design** - Security integrated from the start, not added later
3. **Fail securely** - Errors don't expose sensitive information
4. **Least privilege** - Users only access their own resources
5. **Input validation** - Never trust user input

## References

This implementation follows security best practices from:
- OWASP Top 10 (particularly A01:2021 - Broken Access Control, A02:2021 - Cryptographic Failures)
- Express.js Security Best Practices
- Node.js Security Checklist

## Security Acknowledgments

None at this time. Be the first to provide constructive security feedback!

---

**Last Updated:** January 30, 2026  
**Project Status:** Educational/Portfolio (Not Production-Ready)
