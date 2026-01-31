# Role System Documentation

## Overview

The application has a clear separation between **Management Organization** and **Client Organizations** with distinct role systems.

---

## 1. Management Organization (Fuel Empowerment Systems)

### Purpose
The management organization oversees the entire system and manages client organizations.

### Roles (stored in `profiles.role`)

| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | Full system access | All features, all organizations |
| `admin` | Management administrator | Manage client organizations, system settings |
| `manager` | Management supervisor | View reports, manage specific areas |
| `user` | Standard management user | Limited management access |

### Key Points
- **NO 'driver' role** in management organization
- Management users cannot have driver-level access
- If management org wants vehicles/drivers, they must:
  1. Create a separate Client Organization
  2. Load vehicles and drivers under that client org
  3. This keeps roles separate and clean

### Example
```
Fuel Empowerment Systems (Management Org)
├── John Smith (super_admin) - Full system access
├── Jane Doe (admin) - Manages client accounts
└── Bob Johnson (manager) - Views reports

Fuel Empowerment Systems Fleet (Client Org) - Separate organization
├── John Smith (client user) - Manages their own fleet
└── Driver Mike (driver) - Drives company vehicles
```

---

## 2. Client Organizations

### Purpose
Organizations that use the system to manage their fleet, drivers, and fuel transactions.

### User Types (stored in `organization_users.user_type`)

| User Type | Description | Typical Permissions |
|-----------|-------------|-------------------|
| `main_user` | Primary account owner | Full access to organization |
| `secondary_main_user` | Secondary owner | Full access to organization |
| `billing_user` | Handles invoices and payments | View/manage invoices, financial data |
| `fleet_user` | Manages vehicles | Add/edit/delete vehicles |
| `driver_user` | Manages drivers | Add/edit/delete drivers |
| `vehicle_user` | Vehicle management | View/edit vehicles |
| `finance_user` | Financial data access | View financial reports and data |
| `reports_user` | Report generation | Create and view reports |
| `standard_user` | Basic access | View-only or limited access |

### Granular Permissions
Each user has specific permission flags:
- `can_add_vehicles`
- `can_edit_vehicles`
- `can_delete_vehicles`
- `can_add_drivers`
- `can_edit_drivers`
- `can_delete_drivers`
- `can_view_reports`
- `can_edit_organization_info`
- `can_view_fuel_transactions`
- `can_create_reports`
- `can_view_custom_reports`
- `can_manage_users`
- `can_view_financial_data`

### Driver Access
- Drivers are stored in separate `drivers` table
- Drivers access system ONLY via **Driver Mobile App**
- A driver can ALSO be loaded as an `organization_users` entry for client portal access

### Example Scenario: Private Individual
```
John's Personal Fleet (Client Organization)
├── John (main_user + driver)
    - Loaded as organization user: Full client portal access
    - Also loaded as driver: Can use Driver Mobile App
    - This gives John both management and driver capabilities
```

---

## 3. Database Structure

### profiles table
```sql
- id (uuid) - References auth.users
- organization_id (uuid) - References organizations
- full_name (text)
- role (text) - CHECK: 'super_admin', 'admin', 'manager', 'user'
- Used for: Management org users and client org main account holders
```

### organization_users table
```sql
- id (uuid)
- organization_id (uuid)
- user_id (uuid) - References auth.users
- email (text)
- name, surname, title (text)
- role (text) - Legacy: 'main_user', 'secondary_main_user', 'user'
- user_type (text) - NEW: Classification of user
- [permission flags...]
- Used for: Client organization users
```

### drivers table
```sql
- id (uuid)
- organization_id (uuid)
- full_name, license_number, etc.
- Used for: Drivers who access via Mobile App
```

---

## 4. Implementation Guidelines

### Creating Management Users
1. Use standard Supabase auth signup
2. Assign role in `profiles.role`: 'super_admin', 'admin', 'manager', or 'user'
3. Set `organization_id` to management org ID

### Creating Client Organization Users
1. Use the `create-user` edge function
2. Set appropriate `user_type` based on their function
3. Configure granular permissions
4. User gets entry in both `auth.users` and `organization_users`

### Creating Drivers
1. Create entry in `drivers` table
2. Set `organization_id` to client org
3. Driver can only access via Driver Mobile App
4. Optionally: Also create `organization_users` entry for portal access

### Dual Access (Driver + Portal User)
```typescript
// Step 1: Create driver
await supabase.from('drivers').insert({
  organization_id: clientOrgId,
  full_name: 'John Doe',
  license_number: 'ABC123',
  // ... other driver fields
});

// Step 2: Create organization user for portal access
await createUser({
  email: 'john@example.com',
  user_type: 'standard_user',
  can_view_reports: true,
  // ... permissions
});
```

---

## 5. Security & RLS

- Management org users (via `profiles`) can access all organizations
- Client org users can only access their own organization
- Drivers have very limited access (vehicle status, fuel purchases)
- Super admins bypass all restrictions
- All tables have Row Level Security enabled

---

## 6. Frontend Component Guidelines

### For Management Organization Users
- Show role dropdown: 'super_admin', 'admin', 'manager', 'user'
- Use `profiles` table
- Access: SuperAdminDashboard component

### For Client Organization Users
- Show user_type dropdown with client classifications
- Show granular permission checkboxes
- Use `organization_users` table
- Access: ClientDashboard component

### For Drivers
- No complex role selection
- Simple driver registration form
- Use `drivers` table
- Access: DriverMobileApp component

---

## 7. Migration Path

If management org wants to use the system for their own fleet:

1. Create new Client Organization: "Fuel Empowerment Fleet"
2. Load vehicles under this client org
3. Load drivers under this client org
4. Management users can still access via super_admin role
5. Keeps separation between management role and client role

This ensures:
- Clean role separation
- No role confusion
- Proper permissions and access control
- Clear audit trails
