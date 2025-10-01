import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600">
          Authentication Error
        </h1>
        <p className="text-gray-700">
          The login link is invalid or has expired.
        </p>
        <p className="text-gray-600">
          Please try signing in again.
        </p>
        <div className="pt-4">
          <Link href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
