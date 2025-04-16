# Custom File Picker

A modern file picker application that integrates with Google Drive to manage and index files for Stack AI knowledge bases. Built with Next.js and the latest web technologies.

## 🎯 Purpose

This application serves as a bridge between Google Drive and Stack AI, allowing users to:
- Connect to Google Drive and browse files and folders
- Select and index files/folders to create knowledge bases in Stack AI
- Track the indexing status of files
- Manage indexed files without affecting the original Google Drive content
- View synchronization status of knowledge bases

## ✨ Features

### Core Functionality
- **Google Drive Integration**: Browse and select files/folders from your Google Drive
- **File Management**:
  - Read files and folders (similar to `ls` command functionality)
  - Delete files from the index (without affecting Google Drive)
  - Track indexing status of files
  - De-index files when needed

### Enhanced Features
- **Knowledge Base Management**:
  - Sidebar with history of knowledge base IDs
  - Real-time synchronization status
  - Quick access to indexed content
- **Responsive Design**:
  - Clean, monochromatic UI (grayscale theme)
  - Color-coded status indicators for better visibility
  - Responsive table layout for file management
- **Advanced File Operations**:
  - Sort files by name and date
  - Filter files by name
  - Search functionality for quick file access

## 🚀 Tech Stack

- **Framework**: React + Next.js 15.3.0
- **Data Fetching**: Tanstack Query v5 + SWR v2
- **State Management**: Zustand v5
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI (built on Radix UI primitives)
- **Type Safety**: TypeScript
- **Development**: Turbopack for faster development experience

## 🛠️ Technical Choices

The following technologies were specified in the project requirements:

- **Next.js**: Latest stable version for the framework
- **Tanstack Query + SWR**: For efficient data fetching
- **Zustand**: For state management when needed
- **Tailwind CSS**: Latest stable version for styling
- **Shadcn**: Component library compatible with the latest Next.js version

These technologies were chosen to ensure:
- Modern and efficient development
- Type-safe code with TypeScript
- Consistent and responsive UI
- Optimal performance
- Easy state management
- Seamless integration with Google Drive API

## 📦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/netraluis/stack-AI-gdrive-file-picker.git
cd custom-file-picker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```bash
SUPABASE_AUTH_URL=your_supabase_auth_url
ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

The application is deployed on Vercel at [https://stack-ai-gdrive-file-picker-jqg6mqhpg-netraluis-projects.vercel.app](https://stack-ai-gdrive-file-picker-jqg6mqhpg-netraluis-projects.vercel.app)

## 📹 Demo Video

A demo video showcasing the application's features is available at [YOUR_VIDEO_URL]

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tanstack Query Documentation](https://tanstack.com/query/latest)
- [SWR Documentation](https://swr.vercel.app/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
