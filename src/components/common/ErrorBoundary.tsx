import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center p-4"
                >
                    <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Something Went Wrong
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                An unexpected error occurred. Our team has been notified.
                            </p>
                            {this.state.error && (
                                <details className="mt-3 text-left">
                                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
                                        Error details
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label="Retry loading the page"
                            >
                                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                                Try Again
                            </button>
                            <a
                                href="/"
                                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                aria-label="Go back to home page"
                            >
                                <Home className="w-4 h-4" aria-hidden="true" />
                                Go Home
                            </a>
                        </div>

                        {/* Branding */}
                        <p className="text-xs text-gray-400">
                            DakShiksha — GDS Training Platform
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
