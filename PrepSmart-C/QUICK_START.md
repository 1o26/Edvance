# Quick Start Guide - New Features

## ✅ Everything is Complete!

All features have been implemented:
- ✅ PDF Export
- ✅ PPT Export  
- ✅ Quiz Generation
- ✅ Question Paper Generation

## 🚀 How to Run

### 1. Install Dependencies (if not already done)

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set Up Environment Variables

Create `.env` file in `server` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@localhost:5432/edvance?schema=public"
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
```

### 3. Set Up Database

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🧪 Quick Test Steps

1. **Login/Register** at http://localhost:5173
2. **Create or Open** a lesson plan
3. **Click the buttons** in the top right:
   - "Export PDF" - Downloads PDF
   - "Export PPT" - Downloads PowerPoint
   - "Generate Quiz" - Opens quiz modal
   - "Generate QP" - Opens question paper modal

## 📋 What to Check

### PDF Export
- ✅ Button visible
- ✅ PDF downloads
- ✅ Content is correct
- ✅ Formatting is good

### PPT Export
- ✅ Button visible
- ✅ PPTX file downloads
- ✅ Opens in PowerPoint
- ✅ All slides present

### Quiz Generation
- ✅ Button visible
- ✅ Modal opens
- ✅ Questions are relevant
- ✅ Correct answers marked
- ✅ Explanations provided

### Question Paper Generation
- ✅ Button visible
- ✅ Modal opens
- ✅ Multiple sections present
- ✅ Answer key included
- ✅ Questions are relevant

## 🐛 Common Issues

### Issue: Puppeteer fails
**Solution:**
```bash
cd server
npm install puppeteer --force
```

### Issue: API errors
**Solution:** Check `.env` file has correct `GEMINI_API_KEY`

### Issue: Buttons not showing
**Solution:** 
```bash
cd client
npm install
npm run dev
```

## 📚 Full Testing Guide

See `TESTING_GUIDE.md` for detailed testing instructions.

## 📝 Files Changed/Added

### New Files:
- `server/utils/pdfGenerator.js` - PDF generation utility
- `server/utils/pptGenerator.js` - PPT generation utility
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `QUICK_START.md` - This file

### Modified Files:
- `server/routes/lessonPlans.js` - Added 4 new routes
- `client/src/pages/LessonPlanDetail.jsx` - Added UI and modals
- `README.md` - Updated with new features

## 🎯 Next Steps

1. Test all features using the testing guide
2. Verify PDF and PPT exports work correctly
3. Test quiz and question paper generation
4. Check error handling
5. Verify permissions work correctly

## 💡 Tips

- First PDF generation may be slow (Puppeteer downloads Chromium)
- Quiz/Question paper generation takes 10-30 seconds (AI processing)
- Check browser console for any errors
- Check server logs for backend errors



