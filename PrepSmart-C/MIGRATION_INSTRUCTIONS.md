# Database Migration Instructions

## New Features Added

The following new features have been added to Edvance, requiring database schema updates:

1. **Health Score** - AI-generated quality score (1-10) for lesson plans
2. **Curriculum Alignment** - Analysis of alignment with curriculum standards
3. **Language Support** - Multi-language support for lesson plans
4. **AI Suggestions** - Similar plans and templates recommendations

## Database Schema Changes

The `LessonPlan` model has been updated with new fields:
- `healthScore` (Float?) - AI-generated health score
- `healthScoreDetails` (Json?) - Detailed breakdown of health score
- `curriculumAlignment` (Json?) - Curriculum alignment analysis
- `language` (String?) - Language code (default: "en")

## Migration Steps

### Step 1: Generate Prisma Client

```bash
cd server
npx prisma generate
```

### Step 2: Create and Apply Migration

```bash
cd server
npx prisma migrate dev --name add_new_features
```

This will:
- Create a new migration file
- Apply the migration to your database
- Update the Prisma Client

### Step 3: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

Or verify in your database that the `lesson_plans` table has the new columns:
- `healthScore`
- `healthScoreDetails`
- `curriculumAlignment`
- `language`

## If Migration Fails

If you encounter any issues:

1. **Check your database connection** - Make sure PostgreSQL is running
2. **Backup your data** - Always backup before migrations
3. **Reset database** (development only):
   ```bash
   npx prisma migrate reset
   ```
   ⚠️ **WARNING**: This will delete all data!

4. **Manual migration** - You can manually add the columns using SQL:
   ```sql
   ALTER TABLE lesson_plans 
   ADD COLUMN "healthScore" DOUBLE PRECISION,
   ADD COLUMN "healthScoreDetails" JSONB,
   ADD COLUMN "curriculumAlignment" JSONB,
   ADD COLUMN "language" TEXT DEFAULT 'en';
   
   CREATE INDEX IF NOT EXISTS "lesson_plans_healthScore_idx" ON "lesson_plans"("healthScore");
   ```

## After Migration

1. Restart your server to pick up schema changes
2. Test the new features:
   - Generate a health score for a lesson plan
   - Check curriculum alignment
   - Translate a lesson plan
   - View similar plans

## Rollback (if needed)

If you need to rollback:

```bash
cd server
npx prisma migrate resolve --rolled-back <migration_name>
```

Or manually remove the columns from the database.






