# Scuba Diving Map Tracker – Implementation Plan

This step-by-step plan will help guide Copilot and developers through building the app described in the project prompt.

---

## 1. Project Setup

- Initialize a new Git repository.
- Create a `README.md` with project overview.
- Set ### 4.3. CI/CD (Optional)

- Set up GitHub Actions:
  - Run tests on pull requests
  - Linting and code quality checks
  - Automated deployment

---

## 5. Final Testing & Launch

### 5.1. Quality Assurance

- Cross-browser testing
- Performance testing
- Security review
- Accessibility audit

### 5.2. Launch Preparation

- Final review of all features
- Data backup procedures
- Monitoring setup
- Analytics integration

### 5.3. Launch

- Deploy production version
- Monitor for issues
- Gather initial user feedback

---

**How to Use This Plan with Copilot:**

1. **Begin with project scaffolding:** Ask Copilot to set up the initial project structure.

   ```
   "Copilot, scaffold the basic project structure as described in step 1."
   ```

2. **Implement in sequence:** Work through each section methodically.

   ```
   "Copilot, help me implement the user authentication system as described in step 2.3."
   ```

3. **Request specific code:** Get help with specific components or functions.

   ```
   "Copilot, generate the Mongoose schema for dive sites as described in step 2.2."
   ```

4. **Debug and refine:** Ask for help troubleshooting issues.
   ```
   "Copilot, there's an issue with the geocoding service. Help me debug based on step 2.4."
   ```

Remember to commit code frequently and test thoroughly at each step.cture:

- `/backend` - For Node.js/Express API
- `/frontend` - For React frontend
- `/docs` - For documentation
- `/tests` - For integration tests
- Set up environment variables (`.env`) template.
- Configure package managers (npm or yarn).

---

## 2. Backend Development

### 2.1. Initialize Backend

- Scaffold a Node.js + Express project in `/backend`.
- Set up ESLint and Prettier for code quality.
- Install dependencies:
  - Core: `express`, `mongoose`, `dotenv`, `cors`, `helmet`
  - Auth: `jsonwebtoken`, `bcrypt`
  - Validation: `joi` or `express-validator`
  - Geocoding: `node-geocoder` or similar
- Set up directory structure:
  - `/controllers` - Route handlers
  - `/models` - Mongoose schemas
  - `/routes` - API routes
  - `/middleware` - Custom middleware
  - `/utils` - Helper functions
  - `/config` - Configuration files

### 2.2. Database Models

- Design a Mongoose schema for users:

  - `email` (String, unique)
  - `password` (String, hashed)
  - `name` (String)
  - `createdAt` (Date)

- Design a Mongoose schema for dive sites:
  - `siteName` (String, required)
  - `location` (String, required) - town/city name or custom location
  - `latitude` (Number, optional)
  - `longitude` (Number, optional)
  - `date` (Date, required)
  - `notes` (String, optional)
  - `userId` (ObjectId, required) - Reference to User model
  - `createdAt` (Date)
  - `updatedAt` (Date)

### 2.3. Authentication System

- Implement user registration:

  - Validate email and password
  - Hash password with bcrypt
  - Create user in database
  - Generate JWT token

- Implement user login:

  - Validate credentials
  - Compare hashed password
  - Generate and return JWT token

- Create auth middleware:
  - Verify JWT token
  - Extract user ID
  - Add user to request object

### 2.4. Dive Site API

- Implement API endpoints:

  - `GET /api/dives` - List all dive sites for logged-in user
  - `GET /api/dives/:id` - Get specific dive site details
  - `POST /api/dives` - Create new dive site
  - `PUT /api/dives/:id` - Update existing dive site
  - `DELETE /api/dives/:id` - Delete dive site

- Implement geocoding service:

  - Create utility function to convert location names to coordinates
  - Integrate with OpenStreetMap Nominatim API or Google Geocoding API
  - Handle errors and edge cases (location not found, etc.)
  - Add caching for frequently used locations

- Add filtering capabilities:
  - `GET /api/dives?startDate=X&endDate=Y` - Filter by date range
  - `GET /api/dives?location=X` - Filter by location

### 2.5. Sharing API

- Implement public sharing endpoints:
  - Generate unique share ID
  - `GET /api/share/:shareId` - Get publicly shared dive sites

### 2.6. Backend Testing

- Set up Jest testing framework
- Write unit tests:
  - Models - validate schema constraints
  - Controllers - test API logic
  - Middleware - test auth checks
  - Utils - test geocoding functions
- Write integration tests for API endpoints

---

## 3. Frontend Development

### 3.1. Initialize Frontend

- Create React application using Create React App or Vite
- Set up folder structure:

  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components
  - `/src/hooks` - Custom React hooks
  - `/src/services` - API service functions
  - `/src/contexts` - React context providers
  - `/src/utils` - Helper functions
  - `/src/assets` - Images, icons, etc.

- Set up dependencies:

  - UI framework: Tailwind CSS or Material UI
  - Routing: React Router
  - Map: Leaflet.js or Mapbox GL
  - Forms: React Hook Form or Formik
  - API calls: Axios
  - State management: React Context API or Redux Toolkit

- Configure development environment:
  - ESLint and Prettier
  - Environment variables
  - Proxy configuration for API calls

### 3.2. Authentication UI

- Create authentication context:

  - Store user state and token
  - Provide login/logout functions
  - Handle token persistence

- Build registration page:

  - Form with email, password, name fields
  - Validation
  - Error handling
  - Success feedback

- Build login page:

  - Email and password form
  - Validation
  - Error handling
  - "Remember me" option

- Implement protected routes:
  - Redirect unauthenticated users to login
  - Persist authentication state across page refreshes

### 3.3. Dive Site Management UI

- Create dashboard layout:

  - Navigation sidebar/header
  - User profile section
  - Main content area

- Build dive site list view:

  - Table/card layout of all dive sites
  - Sorting and filtering options
  - Pagination if needed
  - Quick actions (edit, delete)

- Create dive site form component:

  - Fields for site name, location, date, notes
  - Validation
  - Geocoding preview (show detected coordinates)
  - Submit and cancel buttons

- Implement CRUD operations:
  - Create new dive site form
  - Edit existing dive site form
  - Delete confirmation dialog

### 3.4. Map Integration

- Implement map component using Leaflet.js:

  - Initialize map with world view
  - Add zoom and pan controls
  - Set up tile layer (OpenStreetMap or Mapbox)

- Integrate dive site data:

  - Fetch dive sites from API
  - Convert to map markers
  - Custom marker icons (optional)
  - Handle loading and error states

- Create interactive markers:

  - Popup with site name, date, and notes
  - Click handlers for additional details
  - Hover effects

- Add map features:
  - Cluster markers for areas with many dives
  - Fit bounds to show all markers
  - Toggle satellite/map views
  - Center on user's location

### 3.5. Sharing Feature

- Implement public share link generation:

  - Create share button
  - Generate and display unique URL
  - Copy to clipboard functionality

- Build public view component:
  - Read-only map for shared link
  - No authentication required
  - Limited functionality (view only)

### 3.6. Mobile Responsiveness

- Implement responsive layouts:

  - Adapt UI for different screen sizes
  - Mobile-first approach
  - Touch-friendly controls for map
  - Collapsible menus and panels

- Test on various devices:
  - Phones (small screens)
  - Tablets (medium screens)
  - Desktops (large screens)

### 3.7. Frontend Testing

- Set up testing environment:

  - React Testing Library
  - Jest
  - Mock service worker for API mocks

- Write component tests:

  - Unit tests for UI components
  - Integration tests for forms and interactions
  - Test authentication flows
  - Test map rendering and interactions

- End-to-end testing (optional):
  - Cypress or Playwright
  - Test critical user flows
  - Test mobile responsiveness

---

## 4. Documentation & DevOps

### 4.1. Documentation

- Create comprehensive README.md:

  - Project overview
  - Setup instructions
  - Environment variables
  - Available scripts

- API documentation:

  - Endpoints
  - Request/response formats
  - Authentication requirements
  - Error codes

- User documentation:
  - How to use the application
  - Features guide
  - Troubleshooting

### 4.2. Deployment

- Backend deployment:

  - Create Dockerfile
  - Set up environment variables
  - Deploy to cloud provider (Heroku, AWS, DigitalOcean)

- Frontend deployment:

  - Build optimization
  - Deploy to Vercel, Netlify, or similar
  - Configure environment variables

- Database setup:
  - MongoDB Atlas or self-hosted
  - Backup strategy
  - Indexing for performance

---

## 6. Review & Iterate

- Test the app end-to-end.
- Fix bugs and polish UI/UX.
- Update documentation as needed.

---

**How to use:**  
Request Copilot to implement each step in order, e.g.,  
“Copilot, scaffold the backend Express project as described in step 2.1.”  
Then proceed to the next step.
