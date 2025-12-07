# TinyApp - URL Shortener

![GitHub last commit](https://img.shields.io/github/last-commit/VioletFigueroa/tinyapp?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/VioletFigueroa/tinyapp?style=flat-square)
![License](https://img.shields.io/badge/license-Educational-blue?style=flat-square)

**Quick Links:** [Security Features](#security-relevance-for-application-security) | [Setup](#getting-started) | [Testing](#running-tests)

---

**How to view artifacts:** Main server logic in `express_server.js`; helper functions in `helpers.js`; views in `/views` folder.

**Result snapshot:** Full-stack web application with authentication, authorization, password hashing, and session management.

**Quick review:**
- **Security focus:** bcrypt password hashing, cookie-based sessions, authorization controls, input validation
- **Key files:** `express_server.js` (server + security controls), `helpers.js` (utilities)
- **Start with:** Review authentication and authorization middleware implementation

## Overview
TinyApp is a full-stack web application built with Node.js and Express that allows users to shorten long URLs (similar to bit.ly). The project demonstrates fundamental web application security concepts including authentication, authorization, password hashing, session management, and access control.

**Developed during:** Lighthouse Labs Web Development Bootcamp (March 2021)

## Security Relevance for Application Security

### Authentication & Password Security
- **bcrypt password hashing** with salt rounds for secure credential storage
- **Password comparison** using timing-safe bcrypt.compare() to prevent timing attacks
- **Secure password storage** - plaintext passwords never stored in database
- Demonstrates understanding of cryptographic hashing vs. encryption
- Industry-standard password security implementation

### Session Management
- **cookie-session middleware** for server-side session handling
- **Signed cookies** with secret keys prevent tampering
- **Session expiration** with configurable maxAge (24 hours)
- **httpOnly flags** prevent XSS-based session theft (implicit in cookie-session)
- Proper session lifecycle management (creation, validation, destruction)

### Authorization & Access Control
- **User-specific resource access** - users can only view/edit/delete their own URLs
- **Authorization checks** on every sensitive endpoint
- **401 Unauthorized** responses for access violations
- **Proper error messages** that don't leak information about other users' data
- Demonstrates principle of least privilege and defense in depth

### Input Validation & Error Handling
- **URL validation** prevents empty or malformed submissions
- **Parameter validation** for route parameters (short URL codes)
- **Error status codes** (400 Bad Request, 401 Unauthorized, 404 Not Found)
- **Safe error messages** that inform users without exposing system internals
- **Redirect validation** prevents open redirect vulnerabilities

### Secure Development Practices
- **Random ID generation** using cryptographically appropriate methods
- **User enumeration protection** - login errors don't reveal if email exists
- **Dependency management** with security-focused packages (bcrypt >=2.0.0)
- **Separation of concerns** - helpers module isolates security-critical functions
- **Code organization** facilitates security review and testing

## Objectives
- Implement secure user authentication from scratch
- Create authorization controls for resource access
- Build RESTful API with proper HTTP methods and status codes
- Demonstrate password hashing and session management
- Handle errors securely without information disclosure

## Methodology
- **Express.js** for routing and middleware architecture
- **EJS templating** for server-side rendering
- **bcrypt** for password hashing and verification
- **cookie-session** for encrypted session management
- **Mocha & Chai** for unit testing security-critical functions

## Key Features
- **User Registration:** Email-based account creation with hashed passwords
- **User Login:** Secure authentication with bcrypt password verification
- **Session Management:** Persistent sessions with secure cookies
- **URL Shortening:** Generate short codes for long URLs
- **URL Management:** Edit and delete owned URLs
- **Access Control:** Users can only manage their own URLs
- **Error Handling:** Appropriate status codes and user-friendly messages

## Technologies Used
- **Backend:** Node.js, Express.js 4.17
- **Templating:** EJS (Embedded JavaScript)
- **Security:** bcrypt >=2.0.0, cookie-session 1.4
- **Utilities:** body-parser, lodash 4.17.21 (security patched)
- **Testing:** Mocha, Chai
- **Development:** nodemon for hot reloading

## Application Security Lessons Learned
- **Password hashing is non-negotiable:** Never store plaintext passwords; bcrypt's adaptive hashing provides future-proof security
- **Session management requires layered security:** Signed cookies, expiration, and proper validation all work together
- **Authorization is separate from authentication:** Being logged in doesn't mean access to all resources
- **Error messages are a security feature:** Balancing user experience with preventing information disclosure requires careful design
- **Dependencies introduce risk:** Regular updates and version pinning (e.g., lodash >=4.17.21) prevent known vulnerabilities
- **Input validation is everywhere:** Client-side, server-side, and database-level validation all serve different security purposes

## Files Included

**Core Application:**
- `express_server.js` - Main server with authentication and authorization logic
- `helpers.js` - Utility functions including random ID generation and user lookup
- `package.json` - Dependencies with security-conscious versioning

**Views (EJS Templates):**
- `views/urls_index.ejs` - User's URL dashboard
- `views/urls_show.ejs` - Individual URL edit page
- `views/urls_new.ejs` - Create new short URL form
- `views/login.ejs` - Login form
- `views/register.ejs` - User registration form
- `views/partials/_header.ejs` - Navigation with session state

**Testing:**
- `test/helpersTest.js` - Unit tests for security-critical helper functions

## Getting Started

### Prerequisites
- Node.js (v10.x or higher)
- npm (v6.x or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VioletFigueroa/tinyapp.git
   cd tinyapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure session secrets** (Production)
   - Edit `express_server.js` line 18
   - Replace placeholder key with cryptographically random string:
   ```javascript
   keys: ["your-secret-key-here"]
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:8080`

### Running Tests

```bash
npm test
```

## User Stories
**As an avid twitter poster:**
I want to be able to shorten links so that I can fit more non-link text in my tweets.

**As a twitter reader:**
I want to be able to visit sites via shortened links so that I can read interesting content.

## Final Product

!["Screenshot of Login Page"](https://github.com/VioletFigueroa/tinyapp/blob/9fc211434dc908f751201fad6be76a9e1a7871ab/docs/login-page.png?raw=true)

*Secure login interface with password hashing*

!["Screenshot of User URLs Page"](https://github.com/VioletFigueroa/tinyapp/blob/9fc211434dc908f751201fad6be76a9e1a7871ab/docs/urls-page.png?raw=true)

*URL management dashboard with authorization controls*

## Usage

### Create an Account
1. Navigate to `/register`
2. Enter email and password
3. Password is automatically hashed with bcrypt

### Login
1. Navigate to `/login`
2. Enter credentials
3. Session cookie established on successful authentication

### Shorten URLs
1. Click "Create New URL"
2. Paste long URL
3. Receive short URL (format: `/u/:shortCode`)

### Manage URLs
- **View all:** `/urls` shows your URL dashboard
- **Edit:** Click edit on any URL you own
- **Delete:** Remove URLs from your collection
- **Share:** Short URLs work for anyone (public access)

### Test Accounts
Demo users (for testing only):
- Email: `user@example.com` / Password: `purple-monkey-dinosaur`
- Email: `user2@example.com` / Password: `dishwasher-funk`

## Security Features Demonstration

### Authorization Test
1. Login as user1, create a URL (e.g., `/u/b6UTxQ`)
2. Note the short URL ID
3. Logout and login as user2
4. Try to access `/urls/b6UTxQ`
5. **Expected:** 401 Unauthorized - demonstrates access control

### Session Security Test
1. Login and note your session cookie
2. Clear cookies (logout)
3. Try to access `/urls/new`
4. **Expected:** Redirect to login - demonstrates session validation

### Password Hashing Verification
- Stored passwords in `users` object are bcrypt hashes
- Format: `$2b$10$...` indicates bcrypt with 10 salt rounds
- **Never** stored in plaintext

## Application Security Career Connection

This project demonstrates several AppSec fundamentals:

1. **Authentication Security:** Implementing industry-standard password hashing and session management
2. **Authorization Controls:** Enforcing access controls and principle of least privilege
3. **Secure Coding:** Following OWASP guidelines for session management and authentication
4. **Threat Awareness:** Understanding common web vulnerabilities (session hijacking, password storage, open redirects)
5. **Security Testing:** Writing tests to validate security assumptions

The skills developed here translate directly to application security work:
- **Code Review:** Identifying authentication/authorization flaws in codebases
- **Security Testing:** Testing login flows, session handling, and access controls
- **Threat Modeling:** Understanding attack vectors against web applications
- **Security Requirements:** Defining security controls for new features
- **Developer Training:** Teaching secure coding practices to development teams

---

**Author:** Violet Figueroa  
**Contact:** [GitHub Profile](https://github.com/VioletFigueroa)  
**Career Focus:** Application Security | Secure Software Development | Web Application Security