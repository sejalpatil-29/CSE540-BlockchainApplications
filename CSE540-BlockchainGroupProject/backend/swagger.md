How to use this:
Copy the entire block of code below.

Go to editor.swagger.io.

Delete all the default text on the left side and paste this code in.

Watch the right side instantly generate the complete, interactive documentation for your frontend team!



--------------------------------------------------------------------------------------------------------------

openapi: 3.0.0
info:
  title: Honest Harvest API
  description: Complete API documentation for the Honest Harvest supply chain blockchain project.
  version: 1.0.0
servers:
  - url: http://localhost:8080
    description: Local Development Server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /:
    get:
      summary: System Health Check
      tags:
        - System
      responses:
        '200':
          description: Server is running
          content:
            text/plain:
              schema:
                type: string
                example: The Honest Harvest API is running!

  /company:
    post:
      summary: Create a new Company
      tags:
        - Company Management
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  example: Green Valley Farms
                permission_level:
                  type: string
                  example: Basic
      responses:
        '201':
          description: Company Created Successfully

  /company/{companyId}:
    get:
      summary: Get Company Details
      tags:
        - Company Management
      parameters:
        - in: path
          name: companyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Company Details Retrieved

  /auth/register:
    post:
      summary: Register a Full User
      tags:
        - Users & Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  example: farmer@greenvalley.com
                password:
                  type: string
                  example: password123
                firstName:
                  type: string
                  example: John
                lastName:
                  type: string
                  example: Tractor
                role:
                  type: string
                  example: farmer
                companyId:
                  type: string
                  format: uuid
                  description: UUID of the company
      responses:
        '201':
          description: User Created Successfully

  /auth/login:
    post:
      summary: User Login
      tags:
        - Users & Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  example: farmer@greenvalley.com
                password:
                  type: string
                  example: password123
      responses:
        '200':
          description: Successful Login (Returns JWT Session Token)
        '401':
          description: Invalid email or password

  /user/{userId}:
    patch:
      summary: Update User Profile
      tags:
        - Users & Authentication
      parameters:
        - in: path
          name: userId
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                firstName:
                  type: string
                  example: Johnny
                lastName:
                  type: string
                  example: Appleseed
      responses:
        '200':
          description: User Profile Updated

  /api/users/register:
    post:
      summary: Register Basic User (Legacy)
      tags:
        - Users & Authentication
      description: Legacy route that creates a user without an email or password.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                public_key:
                  type: string
                  example: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                username:
                  type: string
                  example: Green Valley Farmer
                role:
                  type: string
                  example: farmer
      responses:
        '201':
          description: Basic User Created

  /api/batches:
    post:
      summary: Create a New Batch
      tags:
        - Core Supply Chain
      security:
        - bearerAuth: []
      description: Requires a valid JWT token in the Authorization header.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                batchId:
                  type: string
                  example: BATCH-001
                productName:
                  type: string
                  example: Organic Arabica Coffee
                originLocation:
                  type: string
                  example: Farm Plot 4A
      responses:
        '201':
          description: Batch Created Successfully
        '401':
          description: Access Denied (No Token Provided)
        '403':
          description: Invalid or Expired Token

  /transfers/pending:
    post:
      summary: Initiate a Pending Transfer
      tags:
        - Core Supply Chain
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                batchId:
                  type: string
                  example: BATCH-001
                fromCompany:
                  type: string
                  format: uuid
                toCompany:
                  type: string
                  format: uuid
                senderId:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Transfer Pending Status Created

  /transfers/{transferId}/accept:
    post:
      summary: Accept a Transfer
      tags:
        - Core Supply Chain
      parameters:
        - in: path
          name: transferId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Transfer Accepted in Database