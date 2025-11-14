# Testing Guide - New Features

This guide will help you test the newly added features:
1. PDF Export
2. PPT Export
3. Quiz Generation
4. Question Paper Generation

## Prerequisites

1. **Database Setup**: Make sure PostgreSQL is running and the database is set up
2. **Environment Variables**: Ensure `.env` file is configured in the `server` directory
3. **Dependencies**: All npm packages should be installed

## Step 1: Start the Application

### Terminal 1 - Start Backend Server
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### Terminal 2 - Start Frontend Client
```bash
cd client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Step 2: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Login or Register a new account
3. Navigate to the Dashboard or Lesson Plans page

## Step 3: Create or Select a Lesson Plan

### Option A: Create a New Lesson Plan
1. Click on "Generate Lesson Plan" or "Create Lesson Plan"
2. Fill in the details:
   - Subject (e.g., "Mathematics")
   - Topic (e.g., "Algebra")
   - Grade (e.g., "Grade 10")
   - Duration (e.g., 45 minutes)
3. Click "Generate" or "Create"
4. Wait for the lesson plan to be created

### Option B: Use an Existing Lesson Plan
1. Go to "Lesson Plans" page
2. Click on any existing lesson plan

## Step 4: Test PDF Export

1. On the Lesson Plan Detail page, look for the **"Export PDF"** button in the top right
2. Click the **"Export PDF"** button
3. **Expected Result**: 
   - A PDF file should download automatically
   - The filename should be the lesson plan title (sanitized)
   - Open the PDF and verify:
     - Title and metadata are correct
     - Learning objectives are listed
     - Materials required are shown
     - Lesson flow (introduction, activities, wrap-up) is included
     - Assessment and homework sections are present
     - Footer shows creation date and version

## Step 5: Test PPT Export

1. On the Lesson Plan Detail page, click the **"Export PPT"** button
2. **Expected Result**:
   - A `.pptx` file should download automatically
   - Open the PowerPoint file and verify:
     - Title slide with lesson plan title
     - Slide for Learning Objectives
     - Slide for Materials Required
     - Slide for Introduction
     - Slide(s) for Activities
     - Slide for Wrap-up
     - Slide for Assessment
     - Slide for Homework (if present)
     - Slide for Summary (if present)

## Step 6: Test Quiz Generation

1. On the Lesson Plan Detail page, click the **"Generate Quiz"** button
2. **Expected Result**:
   - Button shows "Generating..." while processing
   - A modal window opens displaying the generated quiz
   - The quiz should contain:
     - Title
     - Subject, Grade, Difficulty, Total Marks
     - Multiple questions (default: 10 questions)
     - Each question should have:
       - Question text
       - 4 options (A, B, C, D)
       - Correct answer highlighted in green
       - Explanation for the correct answer
3. **Verify**:
   - Questions are relevant to the lesson plan content
   - Options are clear and appropriate
   - Correct answers are marked
   - Explanations are provided

## Step 7: Test Question Paper Generation

1. On the Lesson Plan Detail page, click the **"Generate QP"** button
2. **Expected Result**:
   - Button shows "Generating..." while processing
   - A modal window opens displaying the generated question paper
   - The question paper should contain:
     - Title
     - Subject, Grade, Total Marks, Duration
     - Instructions for students
     - Multiple sections:
       - Section A: Multiple Choice Questions
       - Section B: Short Answer Questions
       - Section C: Long Answer Questions
     - Each question should show:
       - Question number
       - Question text
       - Marks allocated
       - Options (for MCQs)
       - Expected answer points (for short/long answers)
     - Answer Key section at the bottom
3. **Verify**:
   - Questions cover the lesson plan content
   - Different question types are included
   - Marks distribution is appropriate
   - Answer key is provided

## Step 8: Test Error Handling

### Test with Invalid Lesson Plan ID
1. Try accessing: `http://localhost:5173/plans/invalid-id`
2. **Expected**: Should show "Lesson plan not found" or redirect

### Test with Network Issues
1. Stop the backend server
2. Try to export PDF or generate quiz
3. **Expected**: Should show an error message

## Step 9: Test Permissions

1. **As a Teacher**:
   - Should be able to export PDF/PPT for own lesson plans
   - Should be able to generate quiz/question paper for own lesson plans
   - Should NOT be able to access other teachers' lesson plans

2. **As HOD/Admin**:
   - Should be able to access all lesson plans
   - Should be able to export and generate for any lesson plan

## Troubleshooting

### Issue: PDF Export Fails
**Possible Causes:**
- Puppeteer not installed correctly
- Missing dependencies
- Browser/Chromium not available

**Solution:**
```bash
cd server
npm install puppeteer --force
```

### Issue: PPT Export Fails
**Possible Causes:**
- pptxgenjs not installed
- Buffer issues

**Solution:**
```bash
cd server
npm install pptxgenjs
```

### Issue: Quiz/Question Paper Generation Fails
**Possible Causes:**
- Gemini API key not configured
- API quota exceeded
- Network issues

**Solution:**
1. Check `.env` file has `GEMINI_API_KEY` set
2. Verify API key is valid
3. Check network connection

### Issue: Buttons Not Showing
**Possible Causes:**
- Frontend not built
- React components not updated

**Solution:**
```bash
cd client
npm install
npm run dev
```

### Issue: Modal Not Opening
**Possible Causes:**
- JavaScript errors in console
- State management issues

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls

## API Endpoints to Test Directly

You can also test the endpoints directly using tools like Postman or curl:

### PDF Export
```bash
curl -X GET "http://localhost:5000/api/lesson-plans/{plan-id}/export/pdf" \
  -H "Authorization: Bearer {your-token}" \
  --output lesson-plan.pdf
```

### PPT Export
```bash
curl -X GET "http://localhost:5000/api/lesson-plans/{plan-id}/export/ppt" \
  -H "Authorization: Bearer {your-token}" \
  --output lesson-plan.pptx
```

### Generate Quiz
```bash
curl -X POST "http://localhost:5000/api/lesson-plans/{plan-id}/generate/quiz" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"numberOfQuestions": 10, "difficulty": "medium"}'
```

### Generate Question Paper
```bash
curl -X POST "http://localhost:5000/api/lesson-plans/{plan-id}/generate/question-paper" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"totalMarks": 50, "difficulty": "medium"}'
```

## Checklist

- [ ] PDF export downloads correctly
- [ ] PPT export downloads correctly
- [ ] Quiz generation works and displays in modal
- [ ] Question paper generation works and displays in modal
- [ ] All buttons are visible on lesson plan detail page
- [ ] Error handling works for invalid requests
- [ ] Permissions are enforced correctly
- [ ] Generated content is relevant to lesson plan
- [ ] Files are properly formatted and readable

## Notes

- **PDF Generation**: Uses Puppeteer, which requires Chromium. First run may take longer as it downloads Chromium.
- **PPT Generation**: Uses pptxgenjs library, which is synchronous.
- **AI Generation**: Uses Google Gemini API. Make sure API key is valid and has quota.
- **Performance**: Quiz and question paper generation may take 10-30 seconds depending on API response time.



