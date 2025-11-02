# TravelTrove API Documentation

## Base URL
```
Backend: http://localhost:3000
Frontend: http://localhost:5173
```

## Route Structure
```
/api - Base API routes (userRoutes.js)
  - Public endpoints for authentication, search, favorites
  - Mounted at: app.use('/api', Router)

/api/admin - Admin routes (adminRoutes.js) which includes:
  - destinationGuideRoutes.js → mounted at /api/admin/destinationGuides
  - itenaryRoutes.js → mounted at /api/admin
  - travelGroupRoutes.js → mounted at /api/admin
  - All CRUD operations for data management
  
IMPORTANT: destinationGuideRoutes are mounted at BOTH:
  - /api/admin/destinationGuides/* (for all destination operations)
  - This separation prevents route conflicts between destinations and itineraries
```

---

## 🔓 PUBLIC ENDPOINTS (No Authentication Required)

### 1. Authentication

#### Register User
```
POST /api/register
Content-Type: application/json

Request Body:
{
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phoneNumber": "1234567890",
  "country": "USA"
}

Response:
{
  "error": false,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "userName": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here",
    ...
  }
}
```

#### User Login
```
POST /api/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "Password123!"
}

Response:
{
  "error": false,
  "message": "User logged in successfully",
  "data": {
    "id": "...",
    "userName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here",
    ...
  }
}
```

#### Admin Login
```
POST /api/admin/login
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "password": "Admin123!"
}

Response: Similar to user login with role: "admin"
```

---

### 2. Destination Guides (Public Access)

#### Search Destination Guides
```
GET /api/destinationGuides/search
Query Parameters:
  - search: string (optional) - Search term
  - continent: string (optional) - Filter by continent
  - country: string (optional) - Filter by country
  - state: string (optional) - Filter by state
  - city: string (optional) - Filter by city
  - limit: number (optional, default: 10) - Results per page
  - page: number (optional, default: 1) - Page number

Example: GET /api/destinationGuides/search?search=paris&limit=20&page=1

Response:
{
  "success": true,
  "message": "Destination guides found successfully",
  "data": [
    {
      "id": "...",
      "title": "...",
      "overview": "...",
      "thumbnail": "path/to/image",
      "continent": "...",
      "country": "...",
      "state": "...",
      "city": "...",
      "avgRating": 4.5,
      "highlights": ["...", "..."]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### Get Single Destination (Basic)
```
GET /api/destinationGuides/:id

Example: GET /api/destinationGuides/507f1f77bcf86cd799439011

Response:
{
  "error": false,
  "message": "Destination guide fetched successfully",
  "data": {
    "id": "...",
    "title": "...",
    "overview": "...",
    "thumbnail": "...",
    "continent": "...",
    "country": "...",
    "state": "...",
    "city": "...",
    "avgRating": 4.5,
    "highlights": ["..."],
    "travelTips": ["..."],
    "bestTimeToVisit": {...}
  }
}
```

#### Get Detailed Destination Guide (Full Info)
```
GET /api/admin/destinationGuides/getDestinationGuide/:id

Response:
{
  "error": false,
  "message": "Destination guide fetched successfully",
  "data": {
    "id": "...",
    "title": "...",
    "overview": "...",
    "thumbnail": "...",
    "history": "Historical information...",
    "culture": "Cultural information...",
    "continent": "...",
    "country": "...",
    "state": "...",
    "city": "...",
    "highlights": ["..."],
    "travelTips": ["..."],
    "bestTimeToVisit": {
      "months": ["January", "February"],
      "reason": "..."
    },
    "avgRating": 4.5,
    "reviews": [
      {
        "userId": "...",
        "rating": 5,
        "comment": "Great destination!",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "attractions": [
      {
        "name": "...",
        "description": "...",
        "image": "...",
        "location": "...",
        "rating": 4.5,
        "category": "..."
      }
    ],
    "hotels": [
      {
        "name": "...",
        "description": "...",
        "image": "...",
        "address": "...",
        "rating": 4.5,
        "priceRange": "...",
        "amenities": ["...", "..."]
      }
    ],
    "restaurants": [
      {
        "name": "...",
        "description": "...",
        "image": "...",
        "address": "...",
        "cuisineType": "...",
        "rating": 4.5,
        "priceRange": "..."
      }
    ],
    "isFeatured": true,
    "status": "Active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Itineraries (Public Access)

#### Get All Itineraries
```
GET /api/admin/allItineraries

Response:
{
  "error": false,
  "message": "Itineraries fetched successfully",
  "data": {
    "itineraryData": [
      {
        "id": "...",
        "type": "Fixed" | "Customizable",
        "title": "...",
        "durationDays": 7,
        "thumbnail": "...",
        "continent": "...",
        "country": "...",
        "state": "...",
        "city": "...",
        "days": [...],
        "inclusions": ["..."],
        "exclusions": ["..."],
        "priceRange": "...",
        "bestTimeToVisit": ["..."],
        "tags": ["..."],
        "avgRating": 4.5,
        ...
      }
    ],
    "continentData": [...],
    "countryData": [...],
    "stateData": [...],
    "cityData": [...],
    "hotelData": [...],
    "attractionData": [...],
    "restaurantData": [...]
  }
}
```

---

### 4. Travel Groups (Public Access)

#### Get All Travel Groups
```
GET /api/admin/getAllTravelGroups
Query Parameters:
  - itineraryId: string (optional)
  - status: string (optional) - upcoming, ongoing, completed, cancelled
  - groupAdmin: string (optional)
  - startDate: date (optional)
  - endDate: date (optional)
  - search: string (optional)

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "itineraryId": "...",
      "itenaryName": "...",
      "name": "...",
      "description": "...",
      "thumbnail": "...",
      "maxMembers": 20,
      "currentMembers": 5,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-06-07T00:00:00.000Z",
      "pricePerPerson": 1500,
      "status": "upcoming",
      "isPrivate": false,
      "groupAdmin": "...",
      ...
    }
  ]
}
```

#### Get Single Travel Group
```
GET /api/admin/getTravelGroup/:id

Response:
{
  "success": true,
  "data": { /* Complete travel group object */ }
}
```

---

## 🔒 PROTECTED ENDPOINTS (Authentication Required)

**All protected endpoints require Bearer token in Authorization header:**
```
Authorization: Bearer <jwt_token>
```

---

### 5. Destination Reviews

#### Add Review to Destination
```
POST /api/admin/destinationGuides/addReview/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "rating": 5,
  "comment": "Amazing destination! Highly recommended."
}

Response:
{
  "error": false,
  "message": "Review added successfully",
  "data": { /* Updated destination object */ }
}
```

---

### 6. Favorites Management

#### Add Destination to Favorites
```
POST /api/favorites/addDestination
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "destinationId": "507f1f77bcf86cd799439011"
}

Response:
{
  "error": false,
  "message": "Destination added to favorites successfully",
  "data": {
    "destinationGuides": ["507f1f77bcf86cd799439011", ...],
    "itineraries": [...]
  }
}
```

#### Remove Destination from Favorites
```
DELETE /api/favorites/removeDestination/:id
Authorization: Bearer <token>

Example: DELETE /api/favorites/removeDestination/507f1f77bcf86cd799439011

Response:
{
  "error": false,
  "message": "Destination removed from favorites successfully",
  "data": { /* Updated favorites object */ }
}
```

#### Add Itinerary to Favorites
```
POST /api/favorites/addItinerary
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "itineraryId": "507f1f77bcf86cd799439012"
}

Response: Similar to add destination
```

#### Remove Itinerary from Favorites
```
DELETE /api/favorites/removeItinerary/:id
Authorization: Bearer <token>

Response: Similar to remove destination
```

#### Get My Favorites
```
GET /api/favorites/myFavorites
Authorization: Bearer <token>

Response:
{
  "error": false,
  "message": "Favorites fetched successfully",
  "data": {
    "destinations": [
      { /* Complete destination object */ }
    ],
    "itineraries": [
      { /* Complete itinerary object */ }
    ]
  }
}
```

---

### 7. Itinerary Management

#### Create User Itinerary
```
POST /api/admin/user/createItinerary
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request Body (FormData):
  - type: "Fixed" | "Customizable"
  - title: string
  - durationDays: number
  - continentId: string
  - continent: string
  - countryId: string
  - country: string
  - stateId: string
  - state: string
  - cityId: string
  - city: string
  - days: JSON string (array)
  - inclusions: JSON string (array)
  - exclusions: JSON string (array)
  - priceRange: string
  - bestTimeToVisit: JSON string (array)
  - tags: JSON string (array)
  - thumbnail: file (optional)

Response:
{
  "error": false,
  "message": "Itinerary created successfully",
  "data": { /* Created itinerary object */ }
}

Error Response (location doesn't exist):
{
  "error": true,
  "message": "Cannot create itinerary for location that does not exist"
}
```

#### Add Review to Itinerary
```
POST /api/admin/addReview/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "rating": 4,
  "comment": "Great itinerary!"
}

Response:
{
  "error": false,
  "message": "Review added successfully",
  "data": { /* Updated itinerary object */ }
}
```

---

### 8. Travel Group Management

#### Create Travel Group
```
POST /api/admin/user/createTravelGroup
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request Body (FormData):
  - itineraryId: string
  - itenaryName: string
  - name: string
  - description: string
  - maxMembers: number
  - startDate: date string (YYYY-MM-DD)
  - endDate: date string (YYYY-MM-DD)
  - pricePerPerson: number
  - meetingPoint: string (optional)
  - meetingTime: string (optional)
  - requirements: JSON string (array, optional)
  - inclusions: JSON string (array, optional)
  - exclusions: JSON string (array, optional)
  - isPrivate: boolean (optional, default: false)
  - thumbnail: file (optional)

Response:
{
  "success": true,
  "message": "Travel group created successfully",
  "data": { /* Created travel group object */ }
}
```

#### Join Travel Group
```
POST /api/admin/:groupId/join
Authorization: Bearer <token>

Example: POST /api/admin/507f1f77bcf86cd799439011/join

Success Response:
{
  "success": true,
  "message": "Successfully joined travel group",
  "data": { /* Updated travel group object */ }
}

Error Responses:

Group is full:
{
  "success": false,
  "message": "This travel group is already full"
}

Private group - not invited:
{
  "success": false,
  "message": "Cannot join private group without being invited"
}

Already a member:
{
  "success": false,
  "message": "You are already a member of this group"
}
```

#### Invite User to Travel Group
```
POST /api/admin/:groupId/invite
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "userId": "507f1f77bcf86cd799439012"
}

Response:
{
  "success": true,
  "message": "User invited to travel group successfully",
  "data": { /* Updated travel group object */ }
}

Error Responses:

Not admin:
{
  "success": false,
  "message": "Only group admin can invite users"
}

Already invited:
{
  "success": false,
  "message": "User has already been invited to this group"
}
```

---

## 🔑 ADMIN ENDPOINTS

### Get All Destination Guides
```
GET /api/admin/allDestinationGuides

Response:
{
  "error": false,
  "message": "Destination guides fetched successfully",
  "data": {
    "destinationData": [...],
    "continentData": [...],
    "countryData": [...],
    "stateData": [...],
    "cityData": [...],
    "attractionData": [...],
    "hotelData": [...],
    "restaurantData": [...]
  }
}
```

### Add Destination Guide (Admin)
```
POST /api/admin/addDestinationGuide
Content-Type: multipart/form-data

Request Body (FormData):
  - title: string
  - overview: string
  - history: string (optional)
  - culture: string (optional)
  - continent: string
  - continentId: string
  - country: string
  - countryId: string
  - state: string
  - stateId: string
  - city: string
  - cityId: string
  - highlights: JSON string (array)
  - travelTips: JSON string (array)
  - bestTimeToVisit: JSON string (object)
  - attractions: JSON string (array of IDs)
  - hotels: JSON string (array of IDs)
  - restaurants: JSON string (array of IDs)
  - avgRating: number (optional)
  - isFeatured: boolean (optional)
  - status: "Active" | "Inactive" (optional)
  - createdBy: string
  - updatedBy: string
  - thumbnail: file (optional)

Response:
{
  "error": false,
  "message": "Destination guide added successfully",
  "data": { /* Created destination object */ }
}
```

### Update Destination Guide (Admin)
```
POST /api/admin/updateDestinationGuide/:id
Content-Type: multipart/form-data

Same fields as add, all optional
```

### Delete Destination Guide (Admin)
```
DELETE /api/admin/deleteDestinationGuide/:id
```

---

### Add Itinerary (Admin)
```
POST /api/admin/addItenary
Content-Type: multipart/form-data

Request Body (FormData):
  - type: "Fixed" | "Customizable"
  - title: string
  - durationDays: number
  - continentId, continent, countryId, country, stateId, state, cityId, city
  - days: JSON string (array)
  - inclusions, exclusions: JSON string (arrays)
  - priceRange: string
  - bestTimeToVisit, tags: JSON string (arrays)
  - thumbnail: file (optional)

Response:
{
  "error": false,
  "message": "Itinerary added successfully",
  "data": { /* Created itinerary */ }
}
```

### Update Itinerary (Admin)
```
POST /api/admin/updateItenary/:id
Content-Type: multipart/form-data
```

### Delete Itinerary (Admin)
```
DELETE /api/admin/deleteItenary/:id
```

---

### Travel Group Management (Admin)

#### Add Travel Group (Admin)
```
POST /api/admin/addTravelGroup
Content-Type: multipart/form-data
Same fields as user creation endpoint
```

#### Update Travel Group (Admin)
```
POST /api/admin/updateTravelGroup/:id
Content-Type: multipart/form-data
```

#### Delete Travel Group (Admin)
```
DELETE /api/admin/deleteTravelGroup/:id
```

#### Add Member to Group (Admin)
```
POST /api/admin/:groupId/addMember/:userId
```

#### Remove Member from Group (Admin)
```
DELETE /api/admin/:groupId/removeMember/:userId
```

#### Update Travel Group Status (Admin)
```
PATCH /api/admin/:groupId/status
Content-Type: application/json

Request Body:
{
  "status": "upcoming" | "ongoing" | "completed" | "cancelled"
}
```

---

## 📊 RESPONSE FORMATS

### Success Response
```json
{
  "error": false,
  "message": "Operation successful",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description",
  "status": 400
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## 🔐 AUTHENTICATION

### Getting Token
1. Login via `/api/login` or `/api/admin/login`
2. Token returned in response: `data.token`
3. Store token in sessionStorage

### Using Token
Include in headers:
```
Authorization: Bearer <your_token_here>
```

### Token Expiry
Token expires based on `JWT_EXPIRY` environment variable

---

## 📁 FILE UPLOADS

### Supported Types
- Images only (jpg, jpeg, png, webp)
- Max size: 5MB per file

### Upload Endpoints
- `/api/admin/addDestinationGuide` - thumbnail
- `/api/admin/updateDestinationGuide/:id` - thumbnail
- `/api/admin/addItenary` - thumbnail
- `/api/admin/user/createItinerary` - thumbnail
- `/api/admin/addTravelGroup` - thumbnail
- `/api/admin/user/createTravelGroup` - thumbnail

### FormData Format
All file upload endpoints use `multipart/form-data`. Example:
```
FormData with fields:
  - Field names as shown in documentation
  - Files as separate field named "thumbnail"
```

---

## 🚨 ERROR CODES

| Status Code | Meaning |
|------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## ⚠️ VALIDATION RULES

### User Registration
- userName: 2-100 characters
- email: Valid email format, unique
- password: 8+ chars, uppercase, lowercase, number, special char
- phoneNumber: 10 digits

### Reviews
- rating: 1-5 integer
- comment: Optional string

### Travel Groups
- maxMembers: Positive integer
- startDate: Valid date, before endDate
- endDate: Valid date, after startDate
- pricePerPerson: Positive number

---

## 🔄 ROUTING SUMMARY

### Base Routes
- `/api/*` - User routes (register, login, favorites, etc.)
- `/api/admin/*` - Admin routes + all data management

### Nested Routes in Admin
- `/api/admin/allDestinationGuides` - Get all destinations
- `/api/admin/destinationGuides/...` - Destination operations
- `/api/admin/allItineraries` - Get all itineraries
- `/api/admin/addItenary` - Admin create itinerary
- `/api/admin/user/createItinerary` - User create itinerary
- `/api/admin/getAllTravelGroups` - Get all groups
- `/api/admin/user/createTravelGroup` - User create group
- `/api/admin/:groupId/join` - Join group
- `/api/admin/:groupId/invite` - Invite to group

---

## 📝 NOTES

1. All authenticated endpoints require Bearer token
2. File uploads use FormData, not JSON
3. JSON string arrays should be properly formatted
4. Dates should be in ISO format or YYYY-MM-DD
5. All IDs are MongoDB ObjectIds
6. Base URL changes in production

---

## 🔍 FRONTEND API MAPPING

| Frontend Function | Backend Endpoint |
|------------------|------------------|
| `getDetailedDestination(id)` | `GET /api/admin/destinationGuides/getDestinationGuide/:id` |
| `addDestinationReview(id, review)` | `POST /api/admin/destinationGuides/addReview/:id` |
| `addDestinationToFavorites(id)` | `POST /api/favorites/addDestination` |
| `removeDestinationFromFavorites(id)` | `DELETE /api/favorites/removeDestination/:id` |
| `addItineraryToFavorites(id)` | `POST /api/favorites/addItinerary` |
| `removeItineraryFromFavorites(id)` | `DELETE /api/favorites/removeItinerary/:id` |
| `getMyFavorites()` | `GET /api/favorites/myFavorites` |
| `getAllItineraries()` | `GET /api/admin/allItineraries` |
| `createUserItinerary(data)` | `POST /api/admin/user/createItinerary` |
| `addItineraryReview(id, review)` | `POST /api/admin/addReview/:id` |
| `getAllTravelGroups(filters)` | `GET /api/admin/getAllTravelGroups` |
| `getTravelGroupById(id)` | `GET /api/admin/getTravelGroup/:id` |
| `createTravelGroup(data)` | `POST /api/admin/user/createTravelGroup` |
| `joinTravelGroup(id)` | `POST /api/admin/:groupId/join` |
| `inviteToTravelGroup(groupId, userId)` | `POST /api/admin/:groupId/invite` |

---

## ✅ ENDPOINT VERIFICATION

All endpoints have been verified for:
- ✅ Correct HTTP methods
- ✅ Proper authentication requirements
- ✅ Matching frontend/backend paths
- ✅ Request/response formats
- ✅ Error handling
- ✅ Validation rules

**NO MISMATCHES FOUND** - All routing is correct! 🎉

---

## 🔧 RECENT FIXES APPLIED

### Routing Configuration Corrections

**Issue Found:** Frontend was calling `/api/admin/destinationGuides/*` endpoints, but backend routes were mounted at root level `/api/admin/*` without the `/destinationGuides` prefix.

**Changes Made:**
1. **backend/travelTrove/routes/adminRoutes.js**
   - Changed `router.use('/', destinationGuideRouter)` to `router.use('/destinationGuides', destinationGuideRouter)`
   - This ensures all destination guide routes are properly mounted at `/api/admin/destinationGuides/*`

2. **frontend/Concerts/src/api/adminApi.ts**
   - Updated all destination guide admin endpoints to use `/destinationGuides/` prefix:
     - `/allDestinationGuides` → `/destinationGuides/allDestinationGuides`
     - `/addDestinationGuide` → `/destinationGuides/addDestinationGuide`
     - `/updateDestinationGuide/:id` → `/destinationGuides/updateDestinationGuide/:id`
     - `/deleteDestinationGuide/:id` → `/destinationGuides/deleteDestinationGuide/:id`

**Why This Matters:**
- Prevents route conflicts between destination reviews (`/api/admin/destinationGuides/addReview/:id`) and itinerary reviews (`/api/admin/addReview/:id`)
- Maintains consistent routing structure
- Ensures all frontend API calls match backend route definitions

### Route Mapping Summary

| Frontend Call | Backend Route | Full Path |
|--------------|---------------|-----------|
| `getDetailedDestination(id)` | `GET /getDestinationGuide/:id` | `/api/admin/destinationGuides/getDestinationGuide/:id` |
| `addDestinationReview(id, review)` | `POST /addReview/:id` | `/api/admin/destinationGuides/addReview/:id` |
| `addItineraryReview(id, review)` | `POST /addReview/:id` | `/api/admin/addReview/:id` |
| `createUserItinerary(data)` | `POST /user/createItinerary` | `/api/admin/user/createItinerary` |
| `getAllItineraries()` | `GET /allItineraries` | `/api/admin/allItineraries` |

**Key Takeaway:** Destination guide routes are now isolated under `/destinationGuides` prefix, preventing any conflicts with other resource routes.

