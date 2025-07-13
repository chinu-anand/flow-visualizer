import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Copy, X } from 'lucide-react';
import { Node as FlowNode } from 'reactflow';

interface LogViewerProps {
	selectedNode: FlowNode;
	onClose: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ selectedNode, onClose }) => {
	const [activeTab, setActiveTab] = useState<'overview' | 'raw'>('overview');
	const [isCopied, setIsCopied] = useState(false);
	const jsonRef = useRef<HTMLPreElement>(null);

	// Copy JSON to clipboard
	const copyToClipboard = (content?: any) => {
		const textToCopy = content
			? typeof content === 'string' ? content : JSON.stringify(content, null, 2)
			: selectedNode && jsonRef.current ? JSON.stringify(selectedNode.data.fullLog, null, 2) : '';

		navigator.clipboard.writeText(textToCopy)
			.then(() => {
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), 2000);
			})
			.catch(err => console.error('Failed to copy: ', err));
	};

	// Format JSON for display
	const formatJsonForDisplay = (json: any) => {
		if (!json) return null;
		try {
			return JSON.stringify(json, null, 2);
		} catch (e) {
			return String(json);
		}
	};

	return (
		<Card className="border-0 rounded-none h-full">
			<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
				<CardTitle className="text-lg font-semibold">Log Details</CardTitle>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="h-8 w-8"
				>
					<X className="h-5 w-5" />
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'raw')} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="raw">Raw</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="p-4 space-y-5">
						{/* Event */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
							<span className="text-purple-700 dark:text-purple-400 text-xl">
								<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
							</span>
							<div className="flex flex-col gap-1">
								<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Event</h3>
								<p className="text-lg font-medium text-gray-900 dark:text-white">{selectedNode.data.event}</p>
							</div>
						</div>

						{/* Client App */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
							<span className="text-blue-600 dark:text-blue-400 text-xl">
								<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
							</span>
							<div className="flex flex-col gap-1">
								<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Client App</h3>
								<p className="text-lg font-medium text-gray-900 dark:text-white">{selectedNode.data.clientAppName}</p>
							</div>
						</div>

						{/* Status Code & Latency */}
						<div className="flex gap-4">
							<div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
								<span className="text-green-600 dark:text-green-400 text-xl">
									<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4-4" /></svg>
								</span>
								<div className="flex flex-col gap-1">
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Status Code</h3>
									<p className={`text-lg font-bold ${selectedNode.data.statusCode >= 200 && selectedNode.data.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{selectedNode.data.statusCode}</p>
								</div>
							</div>
							<div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
								<span className="text-yellow-600 dark:text-yellow-400 text-xl">
									<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
								</span>
								<div className="flex flex-col gap-1">
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Latency</h3>
									<p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{selectedNode.data.latency} ms</p>
								</div>
							</div>
						</div>

						{/* Request URL and Verb */}
						{(selectedNode.data.fullLog?.Request || selectedNode.data.fullLog?.RequestVerb) && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
								<div className="flex items-center gap-2 mb-1">
									<span className="text-indigo-600 dark:text-indigo-400 text-xl">
										<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18" /><path d="M12 3v18" /></svg>
									</span>
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Request Details</h3>
								</div>
								{selectedNode.data.fullLog?.RequestVerb && (
									<div className="flex items-center gap-2">
										<span className="font-medium">Method:</span>
										<span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">{selectedNode.data.fullLog.RequestVerb}</span>
									</div>
								)}
								{selectedNode.data.fullLog?.Request && (
									<div className="flex items-center gap-2">
										<span className="font-medium">URL:</span>
										<span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 break-all">
											{selectedNode.data.fullLog.Request}
										</span>
										<Button
											onClick={() => copyToClipboard(selectedNode.data.fullLog.Request)}
											size="sm"
											variant="outline"
											className="ml-2"
										>
											<Copy className="h-3 w-3 mr-1" /> Copy
										</Button>
									</div>
								)}
							</div>
						)}

						{/* Consumer Request */}
						{selectedNode.data.fullLog?.ConsumerRequest && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
								<div className="flex justify-between items-center mb-2">
									<div className="flex items-center gap-2">
										<span className="text-purple-700 dark:text-purple-400 text-xl">
											<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
										</span>
										<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Consumer Request</h3>
									</div>
									<Button
										onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerRequest)}
										size="sm"
										variant="outline"
									>
										<Copy className="h-3 w-3 mr-1" /> Copy
									</Button>
								</div>
								<div className="relative">
									<pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
										{formatJsonForDisplay(selectedNode.data.fullLog.ConsumerRequest)}
									</pre>
								</div>
							</div>
						)}

						{/* Consumer Response */}
						{selectedNode.data.fullLog?.ConsumerResponse && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
								<div className="flex justify-between items-center mb-2">
									<div className="flex items-center gap-2">
										<span className="text-green-700 dark:text-green-400 text-xl">
											<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
										</span>
										<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Consumer Response</h3>
									</div>
									<Button
										onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerResponse)}
										size="sm"
										variant="outline"
									>
										<Copy className="h-3 w-3 mr-1" /> Copy
									</Button>
								</div>
								<div className="relative">
									<pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
										{formatJsonForDisplay(selectedNode.data.fullLog.ConsumerResponse)}
									</pre>
								</div>
							</div>
						)}

						{/* Backend Request */}
						{selectedNode.data.fullLog?.BackendRequest && selectedNode.data.fullLog.BackendRequest !== "null" && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
								<div className="flex justify-between items-center mb-2">
									<div className="flex items-center gap-2">
										<span className="text-indigo-700 dark:text-indigo-400 text-xl">
											<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
										</span>
										<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Backend Request</h3>
									</div>
									<Button
										onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendRequest)}
										size="sm"
										variant="outline"
									>
										<Copy className="h-3 w-3 mr-1" /> Copy
									</Button>
								</div>
								<div className="relative">
									<pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
										{formatJsonForDisplay(selectedNode.data.fullLog.BackendRequest)}
									</pre>
								</div>
							</div>
						)}

						{/* Backend Response */}
						{selectedNode.data.fullLog?.BackendResponse && selectedNode.data.fullLog.BackendResponse !== "null" && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
								<div className="flex justify-between items-center mb-2">
									<div className="flex items-center gap-2">
										<span className="text-green-700 dark:text-green-400 text-xl">
											<svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
										</span>
										<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Backend Response</h3>
									</div>
									<Button
										onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendResponse)}
										size="sm"
										variant="outline"
									>
										<Copy className="h-3 w-3 mr-1" /> Copy
									</Button>
								</div>
								<div className="relative">
									<pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
										{formatJsonForDisplay(selectedNode.data.fullLog.BackendResponse)}
									</pre>
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="raw" className="p-4">
						<div className="relative">
							<Button
								onClick={() => copyToClipboard(selectedNode.data.fullLog)}
								size="sm"
								variant="outline"
								className="absolute top-2 right-2 flex items-center gap-1"
							>
								{isCopied ? 'Copied!' : <><Copy className="h-3 w-3" /> Copy</>}
							</Button>
							<pre
								ref={jsonRef}
								className="bg-muted p-3 pt-10 rounded-md text-xs overflow-x-auto border"
							>
								{JSON.stringify(selectedNode.data.fullLog, null, 2)}
							</pre>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default LogViewer;
