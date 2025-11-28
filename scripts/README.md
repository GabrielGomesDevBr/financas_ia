# Scripts Directory

Organized collection of utility scripts for database migrations, maintenance, and development.

---

## 📁 Directory Structure

```
scripts/
├── migrations/          # Database migration helpers
│   ├── migrate.js
│   └── run_migrations.js
│
├── maintenance/         # Database maintenance scripts
│   ├── cleanup_duplicates.sql
│   ├── cleanup_family_invites.sql
│   └── fix_missing_family_members.sql
│
├── utils/              # General utilities
│   ├── apply-security-migrations.js
│   ├── check_db.js
│   ├── check_schema_details.js
│   └── generate-pwa-icons.js
│
├── testing/            # Test utilities
│   ├── check-waitlist.js
│   ├── check_user.js
│   ├── check_user_settings.js
│   ├── test_export_query.js
│   └── test-rls.js
│
└── README.md           # This file
```

---

## 🔄 Migrations

### migrate.js
Basic migration runner for Supabase.

```bash
node scripts/migrations/migrate.js
```

### run_migrations.js
Advanced migration runner with error handling.

```bash
node scripts/migrations/run_migrations.js
```

---

## 🧹 Maintenance

### cleanup_duplicates.sql
Removes duplicate records from database.

```bash
# Run via Supabase SQL Editor or psql
psql -f scripts/maintenance/cleanup_duplicates.sql
```

### cleanup_family_invites.sql
Cleans expired and invalid family invites.

```bash
psql -f scripts/maintenance/cleanup_family_invites.sql
```

### fix_missing_family_members.sql
Backfills missing `family_members` records for existing users.

```bash
psql -f scripts/maintenance/fix_missing_family_members.sql
```

---

## 🛠️ Utils

### apply-security-migrations.js
Applies security-related database migrations.

```bash
node scripts/utils/apply-security-migrations.js
```

### check_db.js
Checks database connection and basic health.

```bash
node scripts/utils/check_db.js
```

### check_schema_details.js
Displays detailed schema information.

```bash
node scripts/utils/check_schema_details.js
```

### generate-pwa-icons.js
Generates PWA icons from source image.

```bash
node scripts/utils/generate-pwa-icons.js
```

---

## 🧪 Testing

### check-waitlist.js
Checks waitlist status and users.

```bash
node scripts/testing/check-waitlist.js
```

### check_user.js
Checks specific user data.

```bash
node scripts/testing/check_user.js [user_id]
```

### check_user_settings.js
Displays user settings.

```bash
node scripts/testing/check_user_settings.js [user_id]
```

### test_export_query.js
Tests data export queries.

```bash
node scripts/testing/test_export_query.js
```

### test-rls.js
Tests Row Level Security policies.

```bash
node scripts/testing/test-rls.js
```

---

## ⚙️ Environment Variables

Most scripts require environment variables:

```bash
# Required
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional (for specific scripts)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 📝 Adding New Scripts

### Guidelines

1. **Choose the right category**:
   - `migrations/` - Database structure changes
   - `maintenance/` - Cleanup and fixes
   - `utils/` - General utilities
   - `testing/` - Testing and validation

2. **Add documentation**:
   - JSDoc comments in .js files
   - SQL comments in .sql files
   - Update this README with usage

3. **Error handling**:
   - Always wrap in try-catch
   - Log meaningful errors
   - Exit with proper codes

4. **Environment**:
   - Use dotenv for config
   - Document required variables
   - Provide examples

---

## 🔒 Security Notes

- Never commit `.env` files
- Use `SUPABASE_SERVICE_ROLE_KEY` carefully (server-side only)
- Test migrations on dev environment first
- Always backup before running maintenance scripts

---

## 📚 Resources

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Migration Best Practices](../docs/DATABASE.md)
