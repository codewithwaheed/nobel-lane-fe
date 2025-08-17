function LoadingFallback({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {message ?? "Loading your booking details..."}
        </p>
      </div>
    </div>
  );
}
export default LoadingFallback;
