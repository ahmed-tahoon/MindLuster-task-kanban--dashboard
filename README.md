# Kanban Dashboard - Task Management System


## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query (v5)
- **UI Library**: Material UI (MUI)
- **Drag & Drop**: @dnd-kit
- **API Mock**: json-server
- **Bonus**: jQuery

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18.x or higher
- npm or yarn package manager

## ⚙️ Installation & Setup

### 1. Clone or Download the Project

```bash
cd MindLuster
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js and React
- Material UI components
- Zustand for state management
- React Query for data fetching
- dnd-kit for drag and drop
- json-server for mock API
- TypeScript and type definitions

### 3. Start the Mock API Server

In a **separate terminal window**, run:

```bash
npm run api
```

This starts json-server on `http://localhost:4000` with the tasks data from `db.json`.

**Important**: Keep this terminal running while using the application.

### 4. Start the Development Server

In another terminal window, run:

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 5. Open in Browser

Navigate to `http://localhost:3000` to see the Kanban dashboard.


### Managing Tasks

1. **Create a Task**
   - Click the "New Task" button in the top navigation
   - Fill in the title, description, and select a column
   - Click "Create" to add the task

2. **Edit a Task**
   - Click the edit icon (pencil) on any task card
   - Modify the details in the modal
   - Click "Update" to save changes

3. **Delete a Task**
   - Click the delete icon (trash) on any task card
   - Confirm the deletion in the dialog

4. **Move Tasks Between Columns**
   - Click and hold on a task card
   - Drag it to another column
   - Release to drop and update the task status

5. **Search Tasks**
   - Use the search bar in the top navigation
   - Results update automatically as you type
   - Searches both title and description fields

6. **Add a New Column**
   - Click the "Add Column" button at the end of the board
   - Enter a unique column name in the prompt
   - Confirm to create a new column. It will appear instantly and can accept tasks by drag and drop


### jQuery Bonus Task

Navigate to the "jQuery Bonus" page from the top navigation chip to see:
- Dynamic list management with fade animations
- Input validation with error messages
- Delete functionality with smooth transitions
- Clear all items with staggered animations

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server (port 3000) |
| `npm run build` | Build production-ready application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run api` | Start json-server mock API (port 4000) |
