# SobrancelhaExpress
Estrutura do Backend:
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB
│   │   ├── auth.js            # JWT config
│   │   └── mail.js            # Email (NodeMailer)
│   │
│   ├── models/
│   │   ├── User.js            # Login (role)
│   │   ├── Professional.js
│   │   ├── Client.js
│   │   ├── Service.js
│   │   ├── Appointment.js
│   │   └── Finance.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── professionalController.js
│   │   ├── clientController.js
│   │   ├── serviceController.js
│   │   ├── appointmentController.js
│   │   └── financeController.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── professional.routes.js
│   │   ├── client.routes.js
│   │   ├── service.routes.js
│   │   ├── appointment.routes.js
│   │   └── finance.routes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── conflictMiddleware.js
│   │
│   └── server.js
│
├── .env
└── package.json

sobrancelha-frontend/
├── src/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── authService.js
│   │
│   ├── professional/
│   │   ├── components/
│   │   │   ├── Aside.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── DashboardCards.jsx
│   │   │   └── Calendar.jsx
│   │   │
|   |   |   css/
|   |   |--profissional.css
|   |   |--calendar.css 
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Finance.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Account.jsx
│   │   │
│   │   └── ProfessionalLayout.jsx
│   │
│   ├── client/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Appointment.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   └── ClientLayout.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── authGuard.js
│   │
│   ├── App.jsx
│   └── main.jsx
