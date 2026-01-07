# Salary Management System - Frontend

A modern, responsive React application for managing employee salaries, projects, and commissions.

## 🛠 Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context API

## 📋 Features

### 🔐 Authentication
- JWT-based authentication
- Protected routes
- Persistent login sessions
- Automatic token refresh

### 📊 Dashboard
- Real-time metrics display
- Interactive charts (Pie & Bar charts)
- Paid vs Pending salary visualization
- Quick overview of active employees and payouts

### 👥 Employee Management
- Complete CRUD operations
- Search and filter functionality
- Role-based categorization
- Tech stack management
- Department assignment
- Status tracking (Active/Inactive)

### 📁 Project Management
- Project lifecycle management
- Team assignment (Developers, PM, Team Lead, Manager, Bidder)
- Bonus pool configuration
- Commission setup (Percentage or Fixed)
- Client and budget tracking
- Status management (Active/Completed)

### 💰 Salary Management
- Monthly salary generation
- Detailed salary breakdown
- Payment status tracking
- Commission and bonus calculations
- Payment reference recording
- Salary history per employee

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create .env file in the root of frontend directory
# Add the following:
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/          # Layout components
│   │       ├── Layout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── Projects.tsx
│   │   ├── Salaries.tsx
│   │   └── Settings.tsx
│   ├── services/            # API service layer
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   ├── projectService.ts
│   │   ├── salaryService.ts
│   │   ├── departmentService.ts
│   │   └── dashboardService.ts
│   ├── context/             # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useToast.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── formatters.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## 🎨 UI Components

### Button
Versatile button component with multiple variants and sizes:
- Variants: `primary`, `secondary`, `danger`, `success`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Loading state support

### Input
Form input with validation support:
- Label and error message display
- Helper text
- Required field indicator

### Select
Dropdown select component:
- Label support
- Error handling
- Option mapping

### Modal
Flexible modal dialog:
- Multiple sizes: `sm`, `md`, `lg`, `xl`
- Close on backdrop click
- Smooth animations

### Table
Data table with sorting and custom rendering:
- Column configuration
- Custom cell rendering
- Row click handlers
- Empty state handling

### Card
Metric display card:
- Icon support
- Trend indicators
- Customizable colors

### Toast
Notification system:
- Types: `success`, `error`, `warning`, `info`
- Auto-dismiss
- Custom duration

## 🔌 API Integration

All API calls are centralized in the `services` directory. The base API configuration includes:

- Automatic JWT token injection
- Request/response interceptors
- Error handling
- Automatic redirect on 401 (Unauthorized)

### Example Usage

```typescript
import { employeeService } from '../services/employeeService';

// Fetch all employees
const employees = await employeeService.getEmployees();

// Create new employee
const newEmployee = await employeeService.createEmployee(formData);

// Update employee
await employeeService.updateEmployee(id, updateData);

// Delete employee
await employeeService.deleteEmployee(id);
```

## 🎯 Key Features Implementation

### Authentication Flow
1. User enters credentials on login page
2. JWT token stored in localStorage
3. Token automatically attached to all API requests
4. Protected routes check authentication status
5. Automatic logout on token expiration

### Salary Generation
1. Admin selects month for salary generation
2. System fetches all active employees
3. Calculates base salary + bonuses + commissions
4. Creates salary records with "Pending" status
5. Displays in salary management interface

### Commission Calculation
- **Percentage-based:** Commission = (Project Amount × Percentage) / 100
- **Fixed amount:** Direct fixed commission value
- Supports multiple commission types per project

## 🎨 Styling & Theming

The application uses Tailwind CSS with a custom color scheme:

- **Primary:** Blue tones for main actions
- **Success:** Green for paid/success states
- **Danger:** Red for delete/error states
- **Gray:** Neutral colors for backgrounds and text

### Custom Tailwind Configuration

```javascript
colors: {
  primary: { /* Blue shades */ },
  success: { /* Green shades */ },
  danger: { /* Red shades */ },
}
```

## 🔒 Security

- JWT token-based authentication
- Protected routes with authentication checks
- Automatic token refresh
- Secure API communication
- XSS protection through React's built-in escaping

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
npm run lint
```

## 🚀 Deployment

### Environment Variables

Required environment variables for production:

```
VITE_API_URL=https://your-api-domain.com/api
```

### Build & Deploy

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Nginx

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend is running
   - Verify VITE_API_URL in .env file
   - Check CORS configuration on backend

2. **Authentication Issues**
   - Clear localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoint

3. **Build Errors**
   - Delete node_modules and reinstall
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Check TypeScript errors: `npm run build`

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For technical support or questions, contact the development team.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
