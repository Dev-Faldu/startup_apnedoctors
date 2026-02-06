// components/SocialShare.tsx
export default function SocialShare() {
    const url = encodeURIComponent(
      "https://startup-apnedoctors.vercel.app/"
    );
    const text = encodeURIComponent(
      "ApneDoctors – AI-Powered Remote Healthcare"
    );
  
    return (
      <div className="flex gap-4">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
          target="_blank"
          className="px-4 py-2 bg-blue-700 text-white rounded-lg"
        >
          LinkedIn
        </a>
  
        <a
          href={`https://wa.me/?text=${text}%20${url}`}
          target="_blank"
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          WhatsApp
        </a>
  
        <a
          href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
          target="_blank"
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          X (Twitter)
        </a>
      </div>
    );
  }
  