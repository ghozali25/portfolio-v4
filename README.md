Here’s the translation of your text to English:  

---

# Portfolio V4  
# Tutorial: Running the Project  

Here’s a simple guide to run this project.  

## Prerequisites  

Ensure that you have already installed:  
- **Node.js**  
---

## Steps to Run the Project  

1. **Install all dependencies:**  

   ```bash  
   npm install  
   ```  
   Or use:  

   ```bash  
   npm install --legacy-peer-deps  
   ```  

2. **Run the project:**  

   ```bash  
   npm run dev  
   ```
   
## Creating a Production Build  

To create a production-ready build:  

1. Run the build command:  

   ```bash  
   npm run build  
   ```  

2. The build files will be saved in the `dist` folder. You can upload this folder to your hosting server.  

---

## Notes  

If you encounter issues while running the project, ensure that:  
- Node.js is correctly installed.  
- You’re in the correct project directory.  
- All dependencies are installed without errors.  

---

## Firebase Configuration  

To configure Firebase for this project, follow these steps:  

1. **Add Firebase to the Project:**  
   - Go to the [Firebase Console](https://console.firebase.google.com/).  
   - Create a new project or use an existing one.  

2. **Enable Firestore Database:**  
   - Create a database.  

3. **Go to Project Settings:**  
   - Click the settings icon.  
   - Copy the Firebase configuration.  

4. **Go to Rules:**  
   - Set the rules to `true`.  

5. **Adjust the Collection Structure:**  
   - Set up the collections as shown in the following Fields :

     projects 
      - Description
      - Features
      - Github
      - Img
      - Link
      - TechStack
      - Title
      
      Certificates
      - Img   

6. **Update `firebase.js` and `firebase-comment.js` Files:**  
   - Replace the `firebaseConfig` content with your Firebase configuration.  

---
