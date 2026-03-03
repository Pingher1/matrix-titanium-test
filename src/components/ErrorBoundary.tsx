import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center w-full h-full p-8 text-white min-h-[300px]">
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-lg text-center backdrop-blur shadow-2xl">
                        <h2 className="text-xl font-bold text-red-400 mb-3">Module Failed to Load</h2>
                        <p className="text-gray-300 text-sm mb-4">
                            {this.state.error?.message || "An unexpected error occurred. A 3D model or asset might be missing."}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                if (this.props.onReset) this.props.onReset();
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
