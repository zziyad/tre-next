'use client'

import React, { Component, type ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Error caught by boundary:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback || (
				<div className="flex items-center justify-center py-8">
					<div className="text-center">
						<h2 className="text-lg font-semibold text-destructive mb-2">
							Something went wrong
						</h2>
						<p className="text-muted-foreground mb-4">
							An error occurred while loading this component.
						</p>
						<button
							onClick={() => this.setState({ hasError: false })}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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