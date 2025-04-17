export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-4 border-t-blue-500"></div>
        </div>
    );
}
    