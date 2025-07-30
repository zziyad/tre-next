# Dual Database Setup

This project supports two different database configurations:

## 🗄️ Database Configurations

### 1. **Main Database** (`trs_db_main`)
- **Schema**: Current schema without RBAC
- **URL**: `postgresql://zi:zi@localhost:5432/trs_db_main?schema=public`
- **Features**: Transport reports, events, flight schedules, documents
- **Branch**: `main`

### 2. **RBAC Database** (`trs_db`)
- **Schema**: Complete RBAC implementation
- **URL**: `postgresql://zi:zi@localhost:5432/trs_db?schema=public`
- **Features**: All main features + Role-Based Access Control
- **Branch**: `rbac`

## 🔄 How to Switch Between Databases

### Switch to Main Database (No RBAC)
```bash
./scripts/use-main-db.sh
```

### Switch to RBAC Database
```bash
./scripts/use-rbac-db.sh
```

## 📋 Manual Setup

### For Main Database:
```bash
# Copy main environment
cp env.main .env

# Run migrations
npx prisma migrate deploy

# Start application
npm run dev
```

### For RBAC Database:
```bash
# Copy RBAC environment
cp env.rbac .env

# Run migrations
npx prisma migrate deploy

# Start application
npm run dev
```

## 🗂️ Environment Files

- `env.main` - Configuration for main database
- `env.rbac` - Configuration for RBAC database
- `.env` - Active configuration (copied from one of the above)

## 🔍 Current Status

- **Main Database**: ✅ Set up and ready
- **RBAC Database**: ✅ Already exists and configured
- **Scripts**: ✅ Created and executable

## 🚀 Quick Start

1. **For Main Features (No RBAC)**:
   ```bash
   ./scripts/use-main-db.sh
   npm run dev
   ```

2. **For RBAC Features**:
   ```bash
   ./scripts/use-rbac-db.sh
   npm run dev
   ```

## 📊 Database Differences

| Feature | Main DB | RBAC DB |
|---------|---------|---------|
| Transport Reports | ✅ | ✅ |
| Events | ✅ | ✅ |
| Flight Schedules | ✅ | ✅ |
| Documents | ✅ | ✅ |
| User Management | ✅ | ✅ |
| Role Management | ❌ | ✅ |
| Permission System | ❌ | ✅ |
| Settings Page | ❌ | ✅ | 