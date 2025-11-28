# Testing Guide: Family Members Fix

## Overview
This guide provides manual testing steps to verify that the family_members synchronization fix works correctly.

## Prerequisites
- Access to the deployed application
- Ability to create new user accounts
- Access to Supabase dashboard or SQL console

## Test 1: New User Family Creation

### Steps
1. **Create a new test user**
   - Use incognito/private browser window
   - Navigate to the login page
   - Sign in with Google OAuth using a NEW email address (not previously registered)
   
2. **Complete onboarding**
   - After successful login, you should be redirected to `/onboarding`
   - Enter a family name (e.g., "Test Family")
   - Click "Criar Família e Começar"
   
3. **Verify family_members record (via Supabase)**
   ```sql
   SELECT 
     fm.id,
     fm.family_id,
     fm.user_id,
     fm.role,
     u.email,
     f.name as family_name
   FROM family_members fm
   JOIN users u ON u.id = fm.user_id
   JOIN families f ON f.id = fm.family_id
   WHERE u.email = 'YOUR_TEST_EMAIL_HERE'
   ORDER BY fm.created_at DESC
   LIMIT 1;
   ```
   
   **Expected Result**: Should return 1 row with:
   - `family_id` matching the created family
   - `user_id` matching your user ID
   - `role` = 'admin'

4. **Test Budget Page**
   - Navigate to `/budgets`
   - **Expected Result**: Page loads successfully (no 404 error)
   - You should see either:
     - Empty state with "Create Budget" button, OR
     - Existing budgets if any
   
5. **Test Goals Page**
   - Navigate to `/goals`
   - **Expected Result**: Page loads successfully (no 404 error)
   - You should see either:
     - Empty state with "Create Goal" button, OR
     - Existing goals if any

6. **Test Creating a Budget**
   - Click "New Budget" or equivalent button
   - Fill in budget details
   - Submit
   - **Expected Result**: Budget is created successfully without errors

7. **Test Creating a Goal**
   - Click "New Goal" or equivalent button
   - Fill in goal details
   - Submit
   - **Expected Result**: Goal is created successfully without errors

## Test 2: Fix Existing Users

### Steps

1. **Identify affected users**
   ```sql
   SELECT 
     u.id,
     u.email,
     u.family_id,
     u.role
   FROM users u
   WHERE u.family_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM family_members fm
     WHERE fm.user_id = u.id AND fm.family_id = u.family_id
   );
   ```
   
   **Expected Result**: List of affected users (if any)

2. **Run the fix script**
   ```sql
   -- Copy and paste contents from: 
   -- /home/gabriel/contas_com_ia/scripts/fix_missing_family_members.sql
   ```
   
3. **Verify the fix**
   ```sql
   -- Re-run the query from step 1
   -- Expected Result: Should return 0 rows (no affected users)
   ```

4. **Test affected users**
   - Log in as one of the previously affected users
   - Navigate to `/budgets` and `/goals`
   - **Expected Result**: Both pages should load without 404 errors

## Test 3: API Response Verification

### Using curl or Postman

1. **Get authentication token**
   - Log in to the application
   - Open browser DevTools → Application/Storage → Cookies
   - Copy the session cookie value

2. **Test Budgets API**
   ```bash
   curl -X GET 'https://YOUR_DOMAIN/api/budgets' \
     -H 'Cookie: YOUR_SESSION_COOKIE'
   ```
   
   **Expected Response**:
   ```json
   {
     "success": true,
     "budgets": []
   }
   ```
   
   **NOT**:
   ```json
   {
     "error": "Usuário não pertence a nenhuma família"
   }
   ```

3. **Test Goals API**
   ```bash
   curl -X GET 'https://YOUR_DOMAIN/api/goals' \
     -H 'Cookie: YOUR_SESSION_COOKIE'
   ```
   
   **Expected Response**:
   ```json
   {
     "success": true,
     "goals": []
   }
   ```

## Success Criteria

✅ New users can create families without errors  
✅ `family_members` record is automatically created on family creation  
✅ Budget page loads successfully for new users  
✅ Goals page loads successfully for new users  
✅ Users can create budgets and goals without errors  
✅ Existing affected users are fixed by running the SQL script  

## Rollback Plan

If issues are detected:

1. **Revert API change**
   ```bash
   git revert <commit-hash>
   ```

2. **Remove incorrectly created records** (if needed)
   ```sql
   -- Only if there are duplicate or incorrect records
   DELETE FROM family_members
   WHERE id IN (
     SELECT fm.id FROM family_members fm
     LEFT JOIN users u ON u.id = fm.user_id AND u.family_id = fm.family_id
     WHERE u.id IS NULL
   );
   ```

## Notes

- The fix is **non-breaking**: existing functionality is not affected
- The SQL script is **idempotent**: can be run multiple times safely
- The API change is **defensive**: logs errors but doesn't fail family creation
