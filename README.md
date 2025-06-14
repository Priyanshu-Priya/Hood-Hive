# Hood Hive

## Overview
Hood Hive is a community-driven platform that allows users to explore, submit, and engage with local projects aimed at improving neighborhoods. The website features an interactive map, project submission flow, voting system, and AI-powered engagement tracking.

## Features Implemented
- **Interactive Map:** Displays community projects with categorized pins.
- **Project Listings:** View and filter projects by category, status, or impact score.
- **Project Details Page:** Includes a description, media attachments, progress tracking, and community discussions.
- **User Dashboard:** Tracks personal contributions, points, and recommendations.


## Features to be Implemented
- **Gamification Elements:** Earn points, badges, and participate in challenges.
- **Admin Panel:** Manage submissions, moderate comments, and track community engagement metrics.

## Tech Stack
- **Frontend:** React, React Router, Context API
- **Backend:** Node.js, Express (optional, if required)
- **Database:** Firebase / MongoDB (optional, if required)
- **Authentication:** JWT-based authentication (if implemented)
- **State Management:** Context API / Redux (if scaling required)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Priyanshu-Priya/hood-hive.git
   cd hood-hive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Environment Setup
1. Create a `.env` file in the root directory
2. Add the following environment variables:

```properties
# Firebase Configuration
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_PRIVATE_KEY="your-private-key"
VITE_FIREBASE_CLIENT_EMAIL=your-client-email@example.com

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Session Configuration
SESSION_SECRET=your-session-secret
```

### Getting the Required Keys

1. **Firebase Configuration**:
   - Create a project in [Firebase Console](https://console.firebase.google.com)
   - Go to Project Settings > Service Accounts
   - Generate a new Private Key
   - Copy the values to your .env file

2. **Google Maps API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Maps JavaScript API
   - Create credentials (API key)
   - Add the key to your .env file

3. **Session Secret**:
   - Generate a strong random string for session security

**Note**: Never commit the `.env` file to version control. The above values are just examples.

## Folder Structure
```
hood-hive/
│── public/            # Static assets
│── src/
│   │── components/    # Reusable UI components
│   │── pages/         # Page components
│   │── context/       # Global state management
│   │── styles/        # CSS/SCSS files
│   │── App.js         # Main App component
│   │── index.js       # Entry point
│── package.json       # Dependencies and scripts
│── README.md          # Project documentation
```

## Contribution
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-branch-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your fork and submit a Pull Request.

## License
This project is licensed under the MIT License.
