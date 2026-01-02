# How to Deploy Al-Majlis Monitor

To make your application visible on the internet, you need to "deploy" it. Since this is a modern React application built with Vite, the easiest way is to use a free hosting service like **Netlify** or **Vercel**.

## Option 1: Drag and Drop (Easiest)
1.  **Build the Project**: Run the build command to create a production-ready version of your site.
    ```powershell
    npm run build
    ```
    This will create a `dist` folder in your project directory containing the optimized files.

2.  **Deploy to Netlify**:
    -   Go to [app.netlify.com/drop](https://app.netlify.com/drop).
    -   Sign up or Log in.
    -   Drag and drop the `dist` folder (created in step 1) onto the page.
    -   Netlify will upload your site and give you a live URL (e.g., `https://random-name.netlify.app`) instantly.

## Option 2: Connect to GitHub (Recommended for updates)
If you push your code to GitHub, you can connect Vercel or Netlify to your repository. Every time you push code, it will automatically update the live site.

1.  Push your code to a GitHub repository.
2.  Go to [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com) and sign up.
3.  Click "Add New Project" and select your GitHub repository.
4.  The default settings (Framework: Vite, Output Directory: dist) should work automatically.
5.  Click "Deploy".

## Testing Locally First
Before deploying, you can preview the production build locally to make sure everything looks right:
```powershell
npm run preview
```
This will verify that the built `dist` folder works as expected.
