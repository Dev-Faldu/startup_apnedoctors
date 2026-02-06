// components/ShareApneDoctors.tsx
"use client";

export default function ShareApneDoctors() {
  const shareUrl = "https://startup-apnedoctors.vercel.app/";
  const shareText =
    "ApneDoctors – AI-Powered Remote Healthcare Platform";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "ApneDoctors",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
    >
      Share ApneDoctors
    </button>
  );
}
