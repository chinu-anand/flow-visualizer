# Flow Visualizer

A modern web application for tracing logs across services using Splunk logs. This tool helps internal developers visualize and debug service interactions through trace IDs.

## Features

- **Account ID Search**: Enter an account ID to find associated trace logs
- **Trace ID Table**: View a list of trace IDs with metadata like timestamp, client app name, and status
- **Interactive Graph View**: Visualize the flow of events within a trace using a draggable, zoomable canvas
- **Log Details**: Click on any node to view the full JSON log data

## Tech Stack

- React with TypeScript
- React Router for navigation
- React Flow for graph visualization
- Tailwind CSS for styling
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Project Structure

```
flow-visualizer/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Application entry point
└── README.md           # Project documentation
```

## API Endpoints (Mock)

The application currently uses mock data, but is designed to work with the following API endpoints:

- `GET /api/traceids?accountId=...` - Returns a list of trace IDs with metadata
- `GET /api/graph?traceId=...` - Returns graph structure (nodes and edges) for visualization

## Usage

1. Enter an Account ID on the home page
2. View the list of trace IDs associated with that account
3. Click on a trace ID to view its graph visualization
4. Interact with the graph by dragging, zooming, and clicking on nodes
5. View detailed log information in the sidebar when a node is selected
