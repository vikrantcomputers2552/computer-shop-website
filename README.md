# Computer Shop Website & Admin Panel

A professional, production-ready website for a computer repair & sales shop. Features a public-facing customer site and a secure admin panel for managing products and shop settings.

## Features

- **Public Website**:
  - **Fast Performance**: Built with Vite + React.
  - **Live Product Catalog**: Real-time fetching from Supabase.
  - **Smart Filtering**: Filter by "New" or "Refurbished".
  - **Contact Integration**: "Contact for Price" button auto-generates emails with product details.
  - **Mobile-First**: Fully responsive design with Framer Motion animations.
- **Admin Panel**:
  - **Secure Access**: Email/Password login (No public signup).
  - **Dashboard**: Full CRUD for products and Shop Settings.
  - **Image Handling**: Client-side compression (max 0.5MB) + automatic WebP conversion.
  - **Settings Management**: Update phone, email, hero text, etc. instantly.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Postgres Database, Auth, Storage)
- **Security**: Row Level Security (RLS) policies
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- A [Supabase](https://supabase.com/) account.

### 2. Supabase Setup

1.  **Create Project**: Create a new project in Supabase.
2.  **Database & Storage**:
    - Go to the **SQL Editor** in your dashboard.
    - Copy the contents of `supabase_schema.sql` (root of this repo).
    - Run the script. This creates tables (`products`, `shop_settings`), storage buckets, and applies secure RLS policies.
    - *Note: The script is safe to run multiple times.*
3.  **Create Admin User**:
    - Go to **Authentication** -> **Users**.
    - Click **Add User**, enter Email/Password, and select **"Auto-confirm user"**.
    - *Public signup is disabled in the code for security.*
4.  **Configure URL for Password Reset**:
    - Go to **Authentication** -> **URL Configuration**.
    - Add `http://localhost:5173/admin/update-password` to **Redirect URLs**.

### 3. Environment Variables

1.  Rename `.env.example` to `.env`.
2.  Fill in your keys from Supabase Settings -> API:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
    *Note: The Anon key is safe to obtain in the client app as long as RLS is enabled (which it is).*

### 4. Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

- Public Site: `http://localhost:5173`
- Admin Login: `http://localhost:5173/admin/login`

### 5. Deployment

To build for production:

```bash
npm run build
```

Deploy the `dist` folder to Vercel, Netlify, or similar.
**Important**: When deploying, remember to add your **Redirect URL** (e.g., `https://your-site.com/admin/update-password`) in the Supabase Dashboard.

## Security Notes

- **Git Hygiene**: `.env` and `.sql` files are ignored to prevent credential leaks.
- **RLS Enforced**:
  - Public: Read-only access to products/settings.
  - Admin: Full Write access (Insert/Update/Delete).
  - Enforced by Postgres engine, not just frontend logic.
