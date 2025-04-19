# REST API Plan

## 1. Resources

- **Users**: Mapped to the `users` table. Contains user credentials and creation date.
- **Flashcards**: Mapped to the `flashcards` table. Stores flashcard content and metadata including source (manual, ai, ai-edited).
- **Generation Sessions**: Mapped to the `generation_sessions` table. Tracks AI flashcard generation sessions, including counts and metadata.
- **Generation Session Error Logs**: Mapped to the `generation_session_error_logs` table. Logs any errors during AI generation (used internally).

## 2. Endpoints

### 2.1 Flashcards Management (Manual & AI-Generated)

#### List Flashcards

- **Method:** GET
- **URL:** `/flashcards`
- **Description:** Retrieves a paginated list of flashcards for the authenticated user.
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - Optional: `source` filter (`manual`, `ai`, `ai-edited`)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "front": "Question?",
        "back": "Answer.",
        "source": "manual",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request (for invalid query parameters), 401 Unauthorized (if JWT is missing or invalid), 500 Internal Server Error (for unexpected server errors)

#### Get Flashcard Details

- **Method:** GET
- **URL:** `/flashcards/:id`
- **Description:** Retrieves details for a specific flashcard.
- **Response:** Flashcard detail object.
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request (if the ID format is invalid), 401 Unauthorized (if JWT is missing or invalid), 403 Forbidden (if access to the flashcard is denied), 404 Not Found, 500 Internal Server Error (for unexpected server errors)

#### Create Flashcards

- **Method:** POST
- **URL:** `/flashcards`
- **Description:** Creates one or more flashcards. Supports manual creation and AI-generated cards.
- **Request Payload:**
  ```json
  {
    "flashcards": [
      {
        "front": "Question text (max 200 characters)",
        "back": "Answer text (max 500 characters)",
        "source": "manual" | "ai" | "ai-edited",
        "generation_id": "optional, required for ai/ai-edited sources"
      }
    ]
  }
  ```
- **Validations:**
  - `front`: Required, string, max 200 characters
  - `back`: Required, string, max 500 characters
  - `source`: Required, must be one of: "manual", "ai", "ai-edited"
  - `generation_id`: Required if source is "ai" or "ai-edited", must be a valid generation session ID
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "generation_id": null,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
      // ...
    ]
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request (for validation errors), 401 Unauthorized (if JWT is missing or invalid), 500 Internal Server Error (for unexpected server errors)

#### Update Flashcard

- **Method:** PUT or PATCH
- **URL:** `/flashcards/:id`
- **Description:** Updates an existing flashcard's content (front and back). If updating an AI-generated flashcard, the source will be automatically changed to 'ai-edited'.
- **Request Payload:**
  ```json
  {
    "front": "Updated question text (max 200 characters)",
    "back": "Updated answer text (max 500 characters)"
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "front": "Updated question text",
    "back": "Updated answer text",
    "source": "manual" | "ai-edited",
    "generation_id": null,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Validations:**
  - `front`: Required, string, max 200 characters
  - `back`: Required, string, max 500 characters
  - If original flashcard has `source: "ai"`, it will be automatically updated to `source: "ai-edited"`
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request (for validation errors), 401 Unauthorized (if JWT is missing or invalid), 403 Forbidden (if access to update the flashcard is denied), 404 Not Found, 500 Internal Server Error (for unexpected server errors)

#### Delete Flashcard

- **Method:** DELETE
- **URL:** `/flashcards/:id`
- **Description:** Deletes a flashcard.
- **Response:** 204 No Content
- **Error Codes:** 401 Unauthorized (if JWT is missing or invalid), 403 Forbidden (if the user is not permitted to delete the flashcard), 404 Not Found, 500 Internal Server Error (for unexpected server errors)

### 2.2 AI Flashcard Generation Endpoints

#### List Generation Sessions

- **Method:** GET
- **URL:** `/generations`
- **Description:** Retrieves a paginated list of flashcard generation sessions for the authenticated user.
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 123,
        "user_id": 1,
        "model": "model-identifier",
        "source_text_length": 1500,
        "created_at": "timestamp",
        "flashcards_count": 10
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:**
  - 400 Bad Request (invalid query parameters)
  - 401 Unauthorized (if JWT is missing or invalid)
  - 500 Internal Server Error

#### Get Generation Session Details

- **Method:** GET
- **URL:** `/generations/:id`
- **Description:** Retrieves details of a specific generation session.
- **Response:**
  ```json
  {
    "generation_session": {
      "id": 123,
      "user_id": 1,
      "model": "model-identifier",
      "source_text_length": 1500,
      "created_at": "timestamp"
    }
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:**
  - 401 Unauthorized (if JWT is missing or invalid)
  - 403 Forbidden (if access to the session is denied)
  - 404 Not Found
  - 500 Internal Server Error

#### Create Generation Session

- **Method:** POST
- **URL:** `/generations`
- **Description:** Initializes the AI flashcard proposals generation process based on user-provided text. The endpoint validates the input, creates a generation session, and triggers the AI service to generate flashcards proposals.
- **Request Payload:**
  ```json
  {
    "text": "Input text (required, 1000-10000 characters)"
  }
  ```
- **Response:**
  ```json
  {
    "generation_session": {
      "id": 123,
      "user_id": 1,
      "model": "model-identifier",
      "source_text_length": 1500,
      "created_at": "timestamp"
    },
    "flashcards_proposals": [
      {
        "id": 1,
        "front": "Generated question text",
        "back": "Generated answer text",
        "source": "ai",
        "generation_id": 123,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
      // ...
    ]
  }
  ```
- **Business Logic Flow:**
  1. Validate input text length (1000-10000 characters)
  2. Create a new generation session record
  3. Trigger asynchronous AI flashcard proposals generation process
  4. Return the generation session details and generated flashcards proposals
- **Validations:**
  - `text`: Required, string, length between 1000-10000 characters
  - `model`: Required, string, must be a valid model identifier
- **Success Codes:** 201 Created
- **Error Codes:**
  - 400 Bad Request (invalid text length or missing required fields)
  - 401 Unauthorized (if JWT is missing or invalid)
  - 500 Internal Server Error (for unexpected server errors) - logs recorded in generation_session_error_logs

### 2.3 Internal/Administrative Endpoints (Optional)

_(Access restricted to admin roles)_

#### Get Generation Session Error Logs

- **Method:** GET
- **URL:** `/generation-error-logs`
- **Description:** Retrieves error logs from AI generation sessions for monitoring and debugging.
- **Response:**
  ```json
  {
    "errors": [
      {
        "id": 1,
        "user_id": 1,
        "source_text_hash": "hash",
        "error_code": "ERROR_CODE",
        "error_message": "Detailed error message",
        "created_at": "timestamp"
      }
      // ...
    ]
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 403 Forbidden

## 3. Validation and Business Logic

- **Flashcard Validations:**
  - `front`: Must be a string with a maximum of 200 characters.
  - `back`: Must be a string with a maximum of 500 characters.
  - `source`: Must be one of `manual`, `ai`, or `ai-edited`.
- **AI Generation:**
  - Text input must be validated to be between 1000 and 10000 characters before processing.
  - Upon generation, a new generation session is created and associated flashcards are returned for review.
  - Errors should be stored in `generation_session_error_logs`.
- Pagination, filtering, and sorting mechanisms are implemented on list endpoints for scalability.

## 4. Security and Performance Considerations

- All communications occur over HTTPS.
- Implement rate limiting on endpoints (especially AI generation and authentication) to prevent abuse.
- Use CORS policies to restrict resource access.
- Leverage database indexes (e.g., on `user_id`, `generation_id`) for query performance optimizations.
- Guard against common vulnerabilities, such as SQL injection and XSS, through proper validation and sanitization.

## Assumptions

- The API backend is implemented in Node.js using TypeScript, aligning with the tech stack (Astro, React, Tailwind, Shadcn/ui).
- Supabase is used for authentication and database operations, and the API adheres to its security practices.
