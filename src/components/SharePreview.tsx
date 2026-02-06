// components/SharePreview.tsx
export default function SharePreview() {
    return (
      <div className="border rounded-2xl p-5 max-w-md shadow-md">
        <img
          src="/apnedoctors-og.png"
          alt="ApneDoctors"
          className="rounded-xl mb-4"
        />
        <h2 className="text-xl font-bold">ApneDoctors</h2>
        <p className="text-gray-600">
          AI-Powered Remote Healthcare Platform
        </p>
        <a
          href="https://startup-apnedoctors.vercel.app/"
          target="_blank"
          className="inline-block mt-3 text-red-600 font-semibold"
        >
          Visit ApneDoctors →
        </a>
      </div>
    );
  }
  