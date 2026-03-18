// Reusable spinner; fullScreen mode adds an overlay so loading is impossible to miss.
export function LoadingSpinner({ label = 'Processing...', fullScreen = false }) {
    return (
        <div className={fullScreen ? 'loading-overlay' : ''} role="status" aria-live="polite">
            <div className="loading-spinner">
                <span className="spinner" aria-hidden="true" />
                <span>{label}</span>
            </div>
        </div>
    )
}

export default LoadingSpinner