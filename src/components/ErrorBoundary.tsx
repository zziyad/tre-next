'use client'

import React from 'react'

interface ErrorBoundaryState {
	hasError: boolean
	error?: Error
}

interface ErrorBoundaryProps {
	children: React.ReactNode
	fallback?: React.ComponentType<{ error: Error }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Error caught by boundary:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return <this.props.fallback error={this.state.error!} />
			}
			
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
						<p className="text-gray-600 mb-4">An error occurred while loading this page.</p>
						<button
							onClick={() => this.setState({ hasError: false })}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Try again
						</button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
} 