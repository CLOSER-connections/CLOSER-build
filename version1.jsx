import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  X, 
  MessageCircle, 
  User, 
  Settings, 
  MapPin, 
  Info, 
  Check, 
  Shield, 
  ArrowLeft,
  Send,
  MoreVertical,
  Sparkles,
  Loader2,
  Save,
  Search,
  SlidersHorizontal,
  Flame,
  ChevronDown,
  Flag,
  Ban,
  Maximize2, 
  Minimize2
} from 'lucide-react';

// --- Gemini API Helper ---

const apiKey = ""; // The execution environment provides the key at runtime.

const callGemini = async (prompt, systemPrompt = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate text.";
    } catch (e) {
      if (i === 4) return "Error connecting to AI service. Please try again.";
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

// --- Mock Data ---

const INTIMACY_OPTIONS = [
  "Cuddling & Touch", "Skin-to-Skin Contact", "Massage", 
  "Affectionate Kissing", "Girlfriend Experience", "Boyfriend Experience",
  "Mutual Oral", "Full Service", "Social Outings", "Platonic Companion"
];

const MOCK_CLIENTS = [
  {
    id: 'c1',
    name: "Alex",
    age: 28,
    type: 'client',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    bio: "Love jazz music and outdoor cafes. Looking for a respectful connection and someone who enjoys a good laugh.",
    location: "Sydney, NSW",
    distance: 5,
    accessibilityNeeds: ["Wheelchair accessible venues required", "Assistance with transfers", "Accessible bathrooms"],
    communication: "Verbal, clear speech preferred",
    intimacyInterests: ["Social Outings", "Cuddling & Touch", "Affectionate Kissing"],
    tags: ["Music", "Coffee", "Cinema"]
  },
  {
    id: 'c2',
    name: "Sam",
    age: 34,
    type: 'client',
    gender: 'Male',
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Tech enthusiast and foodie. I appreciate patience and honesty. Looking for a genuine connection.",
    location: "Newcastle, NSW",
    distance: 120,
    accessibilityNeeds: ["Sensory friendly environments", "Low noise levels", "No strong perfumes"],
    communication: "Use text-to-speech app mainly",
    intimacyInterests: ["Massage", "Full Service", "Skin-to-Skin Contact"],
    tags: ["Tech", "Foodie", "Gaming"]
  }
];

const MOCK_PROVIDERS = [
  {
    id: 'p1',
    name: "Casey",
    age: 29,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    bio: "Independent companion with 3 years experience. Specialized in supporting clients with mobility needs. Friendly, discreet, and respectful.",
    location: "Sydney CBD",
    distance: 1,
    hourlyRate: 150,
    experience: "Certified Disability Support Worker (past role), First Aid",
    services: ["Social accompaniment", "Intimacy", "Travel companion"],
    intimacyInterests: ["Girlfriend Experience", "Full Service", "Cuddling & Touch"],
    tags: ["Empathetic", "Patient", "Fun"]
  },
  {
    id: 'p3',
    name: "Elena",
    age: 35,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    bio: "Tantric practitioner offering a slow, sensual, and healing approach. Experienced with spinal cord injuries.",
    location: "Eastern Suburbs, NSW",
    distance: 8,
    hourlyRate: 250,
    experience: "Tantra certified, 5+ years experience",
    services: ["Tantra", "Intimacy coaching", "Touch therapy"],
    intimacyInterests: ["Massage", "Skin-to-Skin Contact", "Cuddling & Touch"],
    tags: ["Spiritual", "Gentle", "Healing"]
  },
  {
    id: 'p5',
    name: "Jasmine",
    age: 26,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=800&q=80",
    bio: "Patient and kind. Fluent in Auslan. I love connecting with people from all walks of life.",
    location: "Inner West, NSW",
    distance: 6,
    hourlyRate: 160,
    experience: "Auslan Certificate III, Deaf community ally",
    services: ["Auslan friendly dates", "Intimacy", "Conversation"],
    intimacyInterests: ["Girlfriend Experience", "Affectionate Kissing", "Cuddling & Touch"],
    tags: ["Auslan", "Kind", "Creative"]
  },
  {
    id: 'p7',
    name: "Sarah",
    age: 24,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
    bio: "Bubbly and adventurous! I'm great at describing visual environments for blind clients. Let's explore!",
    location: "Coogee, NSW",
    distance: 9,
    hourlyRate: 175,
    experience: "Audio description volunteer",
    services: ["Adventure dates", "Intimacy", "Travel"],
    intimacyInterests: ["Girlfriend Experience", "Full Service", "Travel Companion"],
    tags: ["Bubbly", "Adventurous", "Descriptive"]
  },
  {
    id: 'p9',
    name: "Mia",
    age: 22,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    bio: "University student offering genuine GFE. I love movie nights and deep conversations. New to the industry but very open-minded.",
    location: "Randwick, NSW",
    distance: 5,
    hourlyRate: 200,
    experience: "1 year experience, Psychology student",
    services: ["Dinner dates", "Overnight", "Relaxed vibes"],
    intimacyInterests: ["Girlfriend Experience", "Affectionate Kissing", "Mutual Oral"],
    tags: ["Student", "Sweet", "Chatty"]
  },
  {
    id: 'p10',
    name: "Isabella",
    age: 39,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    bio: "Elegant and sophisticated companion for the discerning gentleman. I provide a high-class, unhurried experience.",
    location: "Mosman, NSW",
    distance: 12,
    hourlyRate: 400,
    experience: "15 years experience",
    services: ["Fine dining", "Events", "Luxury intimacy"],
    intimacyInterests: ["Full Service", "Massage", "Social Outings"],
    tags: ["Elegant", "Luxury", "Mature"]
  },
  {
    id: 'p11',
    name: "Chloe",
    age: 27,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=800&q=80",
    bio: "Fun, fit, and energetic! I'm a personal trainer by day. Happy to assist with active dates or just provide a strong massage.",
    location: "Cronulla, NSW",
    distance: 25,
    hourlyRate: 220,
    experience: "Fitness instructor, Massage therapy",
    services: ["Active dates", "Deep tissue massage", "Fun"],
    intimacyInterests: ["Massage", "Full Service", "Cuddling & Touch"],
    tags: ["Fit", "Energetic", "Strong"]
  },
  {
    id: 'p12',
    name: "Zoe",
    age: 31,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    bio: "Artist and dreamer. I offer a non-judgmental space for you to be yourself. Very experienced with social anxiety.",
    location: "Newtown, NSW",
    distance: 4,
    hourlyRate: 180,
    experience: "Art therapy background",
    services: ["Creative dates", "Relaxed intimacy", "Listening"],
    intimacyInterests: ["Platonic Companion", "Cuddling & Touch", "Affectionate Kissing"],
    tags: ["Artsy", "Alternative", "Soft"]
  },
  {
    id: 'p13',
    name: "Priya",
    age: 25,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=800&q=80",
    bio: "Bollywood fan and foodie. Let's order in and watch a movie, or go out for a curry. I love laughing and making people smile.",
    location: "Parramatta, NSW",
    distance: 20,
    hourlyRate: 160,
    experience: "Hospitality background",
    services: ["Dinner dates", "Casual intimacy", "Fun"],
    intimacyInterests: ["Girlfriend Experience", "Mutual Oral", "Social Outings"],
    tags: ["Fun", "Foodie", "Smiley"]
  },
  {
    id: 'p14',
    name: "Ruby",
    age: 45,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1560717845-968823efbee1?auto=format&fit=crop&w=800&q=80",
    bio: "Nurturing and motherly energy. I specialize in helping men rediscover intimacy after long periods of isolation.",
    location: "Penrith, NSW",
    distance: 45,
    hourlyRate: 150,
    experience: "Aged care background, 5 years escorting",
    services: ["Nurturing touch", "Patience", "Education"],
    intimacyInterests: ["Cuddling & Touch", "Skin-to-Skin Contact", "Massage"],
    tags: ["Nurturing", "Mature", "Patient"]
  },
  {
    id: 'p15',
    name: "Lily",
    age: 23,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=800&q=80",
    bio: "Petite, sweet, and eager to please. I love dressing up and making our time together feel like a fantasy.",
    location: "Chatswood, NSW",
    distance: 10,
    hourlyRate: 250,
    experience: "2 years experience",
    services: ["Roleplay", "GFE", "Dress up"],
    intimacyInterests: ["Full Service", "Girlfriend Experience", "Affectionate Kissing"],
    tags: ["Petite", "Sweet", "Fantasy"]
  },
  {
    id: 'p16',
    name: "Grace",
    age: 33,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1541271696563-3be2f555fc4e?auto=format&fit=crop&w=800&q=80",
    bio: "Professional and discreet. I have a corporate background and can hold a conversation on any topic. Great for business events.",
    location: "North Sydney, NSW",
    distance: 3,
    hourlyRate: 350,
    experience: "Corporate background",
    services: ["Events", "Dinner", "Intellectual connection"],
    intimacyInterests: ["Social Outings", "Platonic Companion", "Full Service"],
    tags: ["Smart", "Classy", "Discreet"]
  },
  {
    id: 'p17',
    name: "Hannah",
    age: 28,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1520512202623-51c5c5301491?auto=format&fit=crop&w=800&q=80",
    bio: "Nature lover. Let's go for a accessible walk/roll in the park or just sit by the water. I'm very grounded.",
    location: "Manly, NSW",
    distance: 14,
    hourlyRate: 190,
    experience: "Outdoor guide",
    services: ["Nature dates", "Relaxed vibes", "Massage"],
    intimacyInterests: ["Massage", "Cuddling & Touch", "Skin-to-Skin Contact"],
    tags: ["Outdoors", "Natural", "Calm"]
  },
  {
    id: 'p18',
    name: "Olivia",
    age: 21,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1583095117917-234cb88f89a9?auto=format&fit=crop&w=800&q=80",
    bio: "Goth girl with a heart of gold. I love horror movies and video games. Open to exploring kinks in a safe, consensual way.",
    location: "Glebe, NSW",
    distance: 3,
    hourlyRate: 200,
    experience: "Kink aware",
    services: ["Gaming dates", "Alternative vibes", "Exploration"],
    intimacyInterests: ["Full Service", "Mutual Oral", "Skin-to-Skin Contact"],
    tags: ["Alt", "Gamer", "Open-minded"]
  },
  {
    id: 'p19',
    name: "Maya",
    age: 30,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
    bio: "Yoga instructor. I bring flexibility and mindfulness to our sessions. Breathing and connection are key.",
    location: "Bondi, NSW",
    distance: 8,
    hourlyRate: 220,
    experience: "Yoga teacher",
    services: ["Tantra intro", "Mindful touch", "Relaxation"],
    intimacyInterests: ["Skin-to-Skin Contact", "Massage", "Cuddling & Touch"],
    tags: ["Yoga", "Mindful", "Flexible"]
  },
  {
    id: 'p20',
    name: "Charlotte",
    age: 26,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1485960994840-902a67e187c8?auto=format&fit=crop&w=800&q=80",
    bio: "Classic girl next door. I love baking and easy conversation. Let's make this feel like a real date.",
    location: "Surry Hills, NSW",
    distance: 2,
    hourlyRate: 200,
    experience: "3 years experience",
    services: ["Dinner", "GFE", "Cuddling"],
    intimacyInterests: ["Girlfriend Experience", "Affectionate Kissing", "Full Service"],
    tags: ["Friendly", "Cute", "Relaxed"]
  },
  {
    id: 'p21',
    name: "Amelia",
    age: 34,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80",
    bio: "Passionate and intense. I love deep connection and exploring pleasure. Very comfortable with different body types.",
    location: "Darlinghurst, NSW",
    distance: 2,
    hourlyRate: 300,
    experience: "5 years experience",
    services: ["Intimacy", "Exploration", "Passion"],
    intimacyInterests: ["Full Service", "Mutual Oral", "Skin-to-Skin Contact"],
    tags: ["Passionate", "Intense", "Experienced"]
  },
  {
    id: 'p22',
    name: "Layla",
    age: 29,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=800&q=80",
    bio: "I have a background in nursing (not practicing). Very comfortable with medical equipment and personal care needs during our date.",
    location: "Westmead, NSW",
    distance: 22,
    hourlyRate: 180,
    experience: "Nursing degree",
    services: ["Care-focused dates", "Patience", "Hygiene assistance"],
    intimacyInterests: ["Cuddling & Touch", "Platonic Companion", "Massage"],
    tags: ["Caring", "Safe", "Knowledgeable"]
  },
  {
    id: 'p23',
    name: "Eva",
    age: 24,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
    bio: "Spontaneous and fun! I love trying new restaurants. I'm legally blind myself, so I understand vision accessibility well.",
    location: "Marrickville, NSW",
    distance: 7,
    hourlyRate: 170,
    experience: "Lived experience with disability",
    services: ["Foodie dates", "Empathy", "Fun"],
    intimacyInterests: ["Girlfriend Experience", "Social Outings", "Full Service"],
    tags: ["Fun", "Relatable", "Blind"]
  },
  {
    id: 'p24',
    name: "Coco",
    age: 27,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1520155707862-5b32817388d6?auto=format&fit=crop&w=800&q=80",
    bio: "Fashion student. I love helping clients pick out outfits or just feeling stylish together. I'm very visual and tactile.",
    location: "Paddington, NSW",
    distance: 4,
    hourlyRate: 250,
    experience: "Fashion styling",
    services: ["Shopping dates", "Styling", "Intimacy"],
    intimacyInterests: ["Social Outings", "Affectionate Kissing", "Girlfriend Experience"],
    tags: ["Stylish", "Visual", "Tactile"]
  },
  {
    id: 'p25',
    name: "Harper",
    age: 32,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1485290334039-a3c69043e517?auto=format&fit=crop&w=800&q=80",
    bio: "Quiet confidence. I don't need to talk much to connect. Perfect for clients who are non-verbal or prefer silence.",
    location: "Balmain, NSW",
    distance: 6,
    hourlyRate: 210,
    experience: "Meditation practitioner",
    services: ["Silent dates", "Touch connection", "Presence"],
    intimacyInterests: ["Cuddling & Touch", "Skin-to-Skin Contact", "Massage"],
    tags: ["Quiet", "Calm", "Present"]
  },
  {
    id: 'p26',
    name: "Bella",
    age: 22,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80",
    bio: "TikTok addict and pop culture lover. If you want to feel young and relevant, I'm your girl. Super LGBTQ+ friendly.",
    location: "Newtown, NSW",
    distance: 3,
    hourlyRate: 180,
    experience: "Gen Z vibes",
    services: ["Hangouts", "Intimacy", "Fun"],
    intimacyInterests: ["Girlfriend Experience", "Full Service", "Mutual Oral"],
    tags: ["Young", "Fun", "Modern"]
  },
  {
    id: 'p27',
    name: "Scarlett",
    age: 37,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1546539782-09332c28d54a?auto=format&fit=crop&w=800&q=80",
    bio: "Redhead with a fiery personality but a soft touch. I love wine bars and long conversations about life.",
    location: "Crows Nest, NSW",
    distance: 9,
    hourlyRate: 280,
    experience: "Life coach background",
    services: ["Dinner", "Conversation", "Intimacy"],
    intimacyInterests: ["Affectionate Kissing", "Girlfriend Experience", "Full Service"],
    tags: ["Fiery", "Intelligent", "Redhead"]
  },
  {
    id: 'p28',
    name: "Aisha",
    age: 29,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=800&q=80",
    bio: "Sensual and slow. I believe intimacy shouldn't be rushed. I book minimum 2-hour appointments to ensure we connect.",
    location: "Double Bay, NSW",
    distance: 5,
    hourlyRate: 300,
    experience: "Tantra enthusiast",
    services: ["Long dates", "Sensual massage", "Connection"],
    intimacyInterests: ["Massage", "Skin-to-Skin Contact", "Cuddling & Touch"],
    tags: ["Slow", "Sensual", "Deep"]
  },
  {
    id: 'p29',
    name: "Tess",
    age: 25,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1496440738360-713d32a6be1d?auto=format&fit=crop&w=800&q=80",
    bio: "Country girl living in the city. I'm down to earth and love a beer at the pub. Very unpretentious.",
    location: "Redfern, NSW",
    distance: 3,
    hourlyRate: 160,
    experience: "Hospitality",
    services: ["Pub dates", "Casual fun", "Intimacy"],
    intimacyInterests: ["Girlfriend Experience", "Full Service", "Mutual Oral"],
    tags: ["Casual", "Fun", "Real"]
  },
  {
    id: 'p30',
    name: "Violet",
    age: 31,
    type: 'provider',
    gender: 'Female',
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c81d?auto=format&fit=crop&w=800&q=80",
    bio: "I have a sensory processing disorder myself, so I am extremely accommodating of sensory needs. Soft fabrics, low light.",
    location: "Ashfield, NSW",
    distance: 8,
    hourlyRate: 190,
    experience: "Neurodivergent",
    services: ["Sensory safe dates", "Gentle touch", "Intimacy"],
    intimacyInterests: ["Cuddling & Touch", "Massage", "Skin-to-Skin Contact"],
    tags: ["Sensory", "Gentle", "Accommodating"]
  }
];

// --- Components ---

// Button Component
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, isLoading }) => {
  const baseStyle = "flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-200 transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700",
    secondary: "bg-white text-gray-800 border-2 border-gray-100 hover:bg-gray-50",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none px-4",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 shadow-none",
    ai: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-purple-200"
  };

  return (
    <button onClick={onClick} disabled={disabled || isLoading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

// Badge Component
const Badge = ({ children, color = "bg-gray-100 text-gray-800" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);

// LegalModal Component
const LegalModal = ({ onAccept }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
      <Shield className="w-16 h-16 text-rose-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Jurisdiction Check</h2>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        This platform connects independent sex workers with clients, including those with disabilities. 
        <br/><br/>
        <strong>Legal Warning:</strong> Access is restricted to jurisdictions where sex work is decriminalized or legal (e.g., New South Wales, Australia).
        <br/><br/>
        By proceeding, you verify that you are at least 18 years old and accessing this service from a legal jurisdiction.
      </p>
      <div className="space-y-3">
        <Button onClick={onAccept} className="w-full">
          I Verify & Agree
        </Button>
        <a href="https://google.com" className="block text-gray-400 text-sm hover:underline">
          Exit Site
        </a>
      </div>
    </div>
  </div>
);

// MatchesList Component
const MatchesList = ({ matches, onSelectMatch }) => (
  <div className="flex flex-col h-full bg-white">
    <div className="p-4 border-b">
      <h2 className="text-xl font-bold text-rose-500">Matches</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Heart className="w-12 h-12 mb-2 opacity-20" />
          <p>No matches yet. Keep swiping!</p>
        </div>
      ) : (
        <div className="divide-y">
          {matches.map(match => (
            <button 
              key={match.id} 
              onClick={() => onSelectMatch(match)}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <img src={match.image} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="ml-4 text-left flex-1">
                <h3 className="font-bold text-gray-800">{match.name}</h3>
                <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="h-20"></div> {/* Space for nav */}
  </div>
);

// ProfileDetailModal Component
const ProfileDetailModal = ({ profile, onClose, onSwipe }) => {
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (showImageZoom) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowImageZoom(false)}>
        <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
        <img src={profile.image} alt={profile.name} className="max-w-full max-h-full object-contain" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col overflow-hidden">
        
        {/* Header Image - Clickable for Zoom */}
        <div className="relative h-72 shrink-0 cursor-zoom-in" onClick={() => setShowImageZoom(true)}>
           <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 backdrop-blur-md">
             <ChevronDown className="w-6 h-6" />
           </button>
           <button className="absolute top-4 left-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 backdrop-blur-md">
             <Maximize2 className="w-5 h-5" />
           </button>
           <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-3xl font-bold">{profile.name}, {profile.age}</h2>
              <div className="flex items-center text-white/90 text-sm mt-1">
                 <MapPin className="w-4 h-4 mr-1" />
                 {profile.location} ({profile.distance}km)
              </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            {/* Price & Role Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-bold border border-rose-200">
                    {profile.type === 'client' ? 'Client' : 'Provider'}
                </span>
                {profile.hourlyRate && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                      ${profile.hourlyRate}/hr
                  </span>
                )}
                 <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                    {profile.gender}
                 </span>
            </div>

            {/* Bio */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About Me</h3>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Intimacy Interests */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center">
                    <Flame className="w-4 h-4 mr-2" /> Intimacy Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                    {profile.intimacyInterests?.map((interest, i) => (
                    <Badge key={i} color="bg-purple-50 text-purple-700 border border-purple-100">{interest}</Badge>
                    ))}
                </div>
            </div>

             {/* Specific Fields */}
             {profile.type === 'client' ? (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
                        <Settings className="w-4 h-4 mr-2" /> Accessibility Needs
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <ul className="space-y-2">
                        {profile.accessibilityNeeds?.map((need, i) => (
                            <li key={i} className="text-blue-900 text-sm flex items-start">
                            <span className="mr-2 text-blue-500">•</span> {need}
                            </li>
                        ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-1">Communication Style</h4>
                        <p className="text-gray-600 text-sm">{profile.communication}</p>
                    </div>
                </div>
             ) : (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center">
                        <Check className="w-4 h-4 mr-2" /> Services & Experience
                    </h3>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-3">
                        <p className="text-rose-900 text-sm font-medium mb-2">Experience:</p>
                        <p className="text-rose-800 text-sm">{profile.experience}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.services?.map((service, i) => (
                             <Badge key={i} color="bg-white text-rose-600 border border-rose-200 shadow-sm">{service}</Badge>
                        ))}
                    </div>
                </div>
             )}

             {/* Tags */}
             <div className="mb-8">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Interests</h3>
                 <div className="flex flex-wrap gap-2">
                    {profile.tags?.map((tag, i) => (
                         <span key={i} className="text-sm text-gray-500 italic">#{tag}</span>
                    ))}
                 </div>
             </div>
        </div>

        {/* Footer Actions - Now Functional */}
        <div className="p-4 border-t bg-white flex gap-4">
             <Button variant="secondary" onClick={() => { if (onSwipe) onSwipe('left'); onClose(); }} className="flex-1 border-rose-200 text-rose-500 hover:bg-rose-50">Pass</Button>
             <Button className="flex-1" icon={Heart} onClick={() => { if (onSwipe) onSwipe('right'); onClose(); }}>Connect</Button>
        </div>
      </div>
    </div>
  );
};

// FilterModal Component
const FilterModal = ({ filters, setFilters, onClose, maxPossiblePrice = 500 }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const toggleIntimacyFilter = (interest) => {
    setLocalFilters(prev => {
      const current = prev.intimacy || [];
      if (current.includes(interest)) {
        return { ...prev, intimacy: current.filter(i => i !== interest) };
      } else {
        return { ...prev, intimacy: [...current, interest] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2 text-rose-500" /> 
            Filters
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto flex-1 pb-4">
          {/* Price Range */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Max Hourly Rate</label>
              <span className="text-sm font-bold text-rose-500">${localFilters.maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={maxPossiblePrice} 
              step="10"
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters({...localFilters, maxPrice: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$0</span>
              <span>${maxPossiblePrice}+</span>
            </div>
          </div>

          {/* Intimacy Filters */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm font-semibold text-purple-700 flex items-center">
                <Flame className="w-4 h-4 mr-1"/> Intimacy Preferences
              </label>
              {localFilters.intimacy?.length > 0 && (
                <button 
                  onClick={() => setLocalFilters({...localFilters, intimacy: []})} 
                  className="text-xs text-gray-400 hover:text-rose-500"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {INTIMACY_OPTIONS.map(opt => {
                const isSelected = localFilters.intimacy?.includes(opt);
                return (
                  <button 
                    key={opt}
                    onClick={() => toggleIntimacyFilter(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Show profiles that match <strong>any</strong> selected preference.
            </p>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Maximum Distance</label>
              <span className="text-sm font-bold text-rose-500">{localFilters.maxDistance} km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="150" 
              value={localFilters.maxDistance}
              onChange={(e) => setLocalFilters({...localFilters, maxDistance: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

           {/* Age Range */}
           <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Age Range</label>
              <span className="text-sm font-bold text-rose-500">{localFilters.minAge} - {localFilters.maxAge}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-xs text-gray-500 mb-1 block">Min Age</label>
                 <input 
                  type="number" 
                  value={localFilters.minAge}
                  onChange={(e) => setLocalFilters({...localFilters, minAge: Math.max(18, parseInt(e.target.value))})}
                  className="w-full p-2 border rounded-lg text-sm"
                 />
              </div>
              <div className="flex-1">
                 <label className="text-xs text-gray-500 mb-1 block">Max Age</label>
                 <input 
                  type="number" 
                  value={localFilters.maxAge}
                  onChange={(e) => setLocalFilters({...localFilters, maxAge: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-lg text-sm"
                 />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 shrink-0">
          <Button onClick={handleApply} className="w-full">
            Apply Filters {localFilters.intimacy?.length > 0 ? `(${localFilters.intimacy.length} prefs)` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Card Component - Updated to Full Image Layout
const Card = ({ profile, swipeDirection, onInfoClick }) => {
  if (!profile) return null;

  return (
    <div className={`absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden transform transition-transform duration-300 ${swipeDirection === 'left' ? '-rotate-12 -translate-x-full opacity-0' : swipeDirection === 'right' ? 'rotate-12 translate-x-full opacity-0' : ''}`}>
      <div className="h-full relative group cursor-pointer" onClick={onInfoClick}>
        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover bg-gray-100" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 pb-20 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-4xl font-bold flex items-center gap-3">
                {profile.name}, {profile.age}
                {profile.type === 'provider' && profile.hourlyRate && (
                  <span className="text-lg bg-green-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                    ${profile.hourlyRate}/hr
                  </span>
                )}
              </h2>
              <div className="flex items-center text-white/90 mt-2 text-lg">
                <MapPin className="w-5 h-5 mr-1" />
                <span className="font-medium">{profile.location} ({profile.distance}km away)</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
             <div className="flex flex-wrap gap-2 mb-3">
               <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                  {profile.gender}
               </span>
               <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                  {profile.type === 'client' ? 'Client' : 'Independent Provider'}
               </span>
             </div>
             
             <p className="text-gray-200 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
          </div>

          <div className="flex gap-2">
             <button onClick={(e) => { e.stopPropagation(); onInfoClick(); }} className="flex items-center text-rose-400 text-sm font-bold hover:text-rose-300 transition-colors">
               <Info className="w-4 h-4 mr-1" /> View Full Profile
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ChatScreen Component
const ChatScreen = ({ match, onClose, onViewProfile }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I liked your profile.", sender: 'them', time: '10:02 AM' }
  ]);
  const [input, setInput] = useState('');
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(null); // 'report' or 'block'
  const scrollRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: 'me', time: 'Now' }]);
    setInput('');
    setTimeout(() => {
      if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  const handleGenerateIcebreaker = async () => {
    setIsGeneratingIcebreaker(true);
    const prompt = `Generate a friendly, respectful, and short (under 20 words) icebreaker message for a dating app match. The match's name is ${match.name}. Their bio says: "${match.bio}". Their tags are: ${match.tags?.join(', ')}. Context: This is an inclusive app for accessible connections.`;
    const icebreaker = await callGemini(prompt, "You are a helpful dating coach assistant.");
    setInput(icebreaker.replace(/"/g, ''));
    setIsGeneratingIcebreaker(false);
  };

  const handleSafetyAction = (action) => {
    setShowSafetyMenu(false);
    setShowSafetyModal(action);
  };

  const confirmSafetyAction = () => {
    // In a real app, this would send data to backend
    setShowSafetyModal(null);
    onClose(); // Close chat
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300 relative">
      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {showSafetyModal === 'block' ? 'User Blocked' : 'Report Received'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {showSafetyModal === 'block' 
                ? `You won't see ${match.name} again. We're sorry you had a negative experience.` 
                : `Thank you for letting us know. Our safety team will review this conversation immediately.`}
              <br/><br/>
              Your safety is our top priority.
            </p>
            <Button onClick={confirmSafetyAction} className="w-full">
              Return to Matches
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 justify-between bg-white shadow-sm z-10">
        <div className="flex items-center">
          <button onClick={onClose} className="mr-3 p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={onViewProfile}
          >
            <div className="relative">
              <img src={match.image} alt={match.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-gray-800">{match.name}</h3>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowSafetyMenu(!showSafetyMenu)} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {/* Dropdown Menu */}
          {showSafetyMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => handleSafetyAction('report')}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Flag className="w-4 h-4 mr-2 text-orange-500" /> Report User
              </button>
              <button 
                onClick={() => handleSafetyAction('block')}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        <div className="text-center text-xs text-gray-400 my-4">
          You matched with {match.name} • Today
        </div>
        {/* Safety Tip */}
        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800 mb-4 mx-4 text-center">
          <span className="font-bold block mb-1">Safety First</span>
          Always verify details and discuss boundaries clearly before meeting.
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              msg.sender === 'me' 
                ? 'bg-rose-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {messages.length < 3 && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="ai" 
              className="text-xs py-2 px-4" 
              onClick={handleGenerateIcebreaker}
              isLoading={isGeneratingIcebreaker}
              icon={Sparkles}
            >
              Suggest Icebreaker
            </Button>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <button type="submit" className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50" disabled={!input.trim()}>
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

// WelcomeScreen Component
const WelcomeScreen = ({ onRoleSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-500 to-purple-600 p-6 text-white">
    <div className="max-w-md w-full text-center space-y-8">
      <div className="flex justify-center mb-4">
        <div className="bg-white p-4 rounded-3xl shadow-lg">
          <Heart className="w-12 h-12 text-rose-500 fill-current" />
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-extrabold mb-2">Connect</h1>
        <p className="text-lg opacity-90">Safe, consensual connections for everyone.</p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <p className="mb-6 font-medium">How would you like to use Connect?</p>
        <div className="space-y-4">
          <button 
            onClick={() => onRoleSelect('client')}
            className="w-full bg-white text-rose-600 p-4 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-between group"
          >
            <span className="flex items-center">
              <User className="w-5 h-5 mr-3" />
              I'm looking for a Companion
            </span>
            <ArrowLeft className="w-5 h-5 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button 
            onClick={() => onRoleSelect('provider')}
            className="w-full bg-transparent border-2 border-white text-white p-4 rounded-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-between group"
          >
            <span className="flex items-center">
              <Heart className="w-5 h-5 mr-3" />
              I'm an Independent Provider
            </span>
            <ArrowLeft className="w-5 h-5 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
      <p className="text-xs opacity-60 mt-8">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
    </div>
  </div>
);

// SetupScreen Component
const SetupScreen = ({ initialData, onSave, mode = 'create', userRole, onBack }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    age: '',
    gender: 'Female',
    interestedIn: [],
    intimacyInterests: [],
    bio: '',
    needs: '',
    services: '',
    hourlyRate: ''
  });
  const [isPolishing, setIsPolishing] = useState(false);

  const toggleInterest = (value) => {
      setFormData(prev => {
          const current = prev.interestedIn || [];
          if (current.includes(value)) {
              return { ...prev, interestedIn: current.filter(i => i !== value) };
          } else {
               return { ...prev, interestedIn: [...current, value] };
          }
      });
  };

  const toggleIntimacy = (value) => {
    setFormData(prev => {
        const current = prev.intimacyInterests || [];
        if (current.includes(value)) {
            return { ...prev, intimacyInterests: current.filter(i => i !== value) };
        } else {
             return { ...prev, intimacyInterests: [...current, value] };
        }
    });
  };

  const handleAIPolish = async () => {
    if (!formData.bio.trim()) return;
    setIsPolishing(true);
    const prompt = `You are a friendly and respectful dating profile assistant. Rewrite the following bio to be warm, clear, and inviting, while maintaining the user's original meaning and privacy. Keep it under 250 characters. Original text: "${formData.bio}"`;
    const polishedBio = await callGemini(prompt, "You are a helpful AI assistant for a dating app.");
    setFormData(prev => ({ ...prev, bio: polishedBio.replace(/"/g, '') }));
    setIsPolishing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center mb-6">
            {mode === 'edit' && (
                <button onClick={onBack} className="mr-3 p-2 bg-gray-200 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
            )}
            <h2 className="text-2xl font-bold text-gray-800">{mode === 'create' ? 'Create your Profile' : 'Edit Profile'}</h2>
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Name"
              />
            </div>
            <div className="w-24">
               <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
               <input 
                type="number" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                placeholder="25"
              />
            </div>
          </div>

          {/* Gender & Preferences */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">I identify as:</label>
                 <select 
                   className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none"
                   value={formData.gender}
                   onChange={(e) => setFormData({...formData, gender: e.target.value})}
                 >
                   <option value="Female">Woman</option>
                   <option value="Male">Man</option>
                   <option value="Non-binary">Non-binary</option>
                   <option value="Transgender">Transgender</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">I want to meet:</label>
                 <div className="flex gap-2">
                    {['Male', 'Female', 'Non-binary', 'Everyone'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => toggleInterest(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${formData.interestedIn?.includes(opt) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-300'}`}
                      >
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>
          </div>

           {/* Intimacy Preferences */}
           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <label className="block text-sm font-bold text-purple-800 mb-2 flex items-center">
                <Flame className="w-4 h-4 mr-2" /> Intimacy Preferences
              </label>
              <p className="text-xs text-purple-600 mb-3">Select what you are open to or looking for. This helps ensure compatible boundaries.</p>
              <div className="flex flex-wrap gap-2">
                 {INTIMACY_OPTIONS.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => toggleIntimacy(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors text-left ${formData.intimacyInterests?.includes(opt) ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                    >
                      {opt}
                    </button>
                 ))}
              </div>
           </div>

          {userRole === 'provider' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indicative Hourly Rate ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500">$</span>
                  <input 
                    type="number" 
                    className="w-full p-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    placeholder="150"
                  />
                </div>
             </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">About Me</label>
              {formData.bio.length > 5 && (
                <button 
                  onClick={handleAIPolish}
                  disabled={isPolishing}
                  className="text-xs font-bold text-purple-600 flex items-center hover:text-purple-800 transition-colors disabled:opacity-50"
                >
                  {isPolishing ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Sparkles className="w-3 h-3 mr-1" />}
                  {isPolishing ? 'Polishing...' : 'AI Polish'}
                </button>
              )}
            </div>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none h-24"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Jot down a few notes about yourself..."
            />
          </div>

          {userRole === 'client' ? (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" /> Accessibility Needs
              </label>
              <textarea 
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={formData.needs}
                onChange={(e) => setFormData({...formData, needs: e.target.value})}
                placeholder="e.g. Wheelchair access, non-verbal communication, sensory sensitivities..."
                rows={4}
              />
            </div>
          ) : (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <label className="block text-sm font-bold text-rose-800 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-2" /> Services & Experience
              </label>
              <textarea 
                className="w-full p-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
                placeholder="List your services, experience with disabilities, and availability..."
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button onClick={() => onSave(formData)} className="w-full" icon={mode === 'create' ? null : Save}>
            {mode === 'create' ? 'Start Matching' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, setup, app
  const [userRole, setUserRole] = useState(null); // 'client' or 'provider'
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('stack'); // stack, matches, chat, profile
  const [activeChat, setActiveChat] = useState(null);
  const [myProfile, setMyProfile] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeProfileDetails, setActiveProfileDetails] = useState(null);
  
  // Filter State
  const [filters, setFilters] = useState({
    maxPrice: 300,
    maxDistance: 50,
    minAge: 18,
    maxAge: 60,
    intimacy: []
  });

  // Initialize and Filter Stack
  useEffect(() => {
    let rawCards = [];
    if (userRole === 'client') {
      rawCards = MOCK_PROVIDERS;
    } else if (userRole === 'provider') {
      rawCards = MOCK_CLIENTS;
    }

    // Apply Filters
    const filtered = rawCards.filter(card => {
        const matchesAge = card.age >= filters.minAge && card.age <= filters.maxAge;
        const matchesDistance = card.distance <= filters.maxDistance;
        // Only filter by price if viewing providers
        const matchesPrice = userRole === 'client' ? (card.hourlyRate <= filters.maxPrice) : true;
        
        // --- Gender Filter Logic ---
        let matchesGender = true;
        if (myProfile.interestedIn && myProfile.interestedIn.length > 0) {
           matchesGender = myProfile.interestedIn.includes(card.gender);
           if(myProfile.interestedIn.includes('Everyone')) matchesGender = true;
        }

        // --- Intimacy Filter Logic ---
        let matchesIntimacy = true;
        if (filters.intimacy && filters.intimacy.length > 0) {
            // Check if card has AT LEAST ONE of the selected intimacy types
            matchesIntimacy = card.intimacyInterests?.some(interest => filters.intimacy.includes(interest));
        }

        return matchesAge && matchesDistance && matchesPrice && matchesGender && matchesIntimacy;
    });

    setCards(filtered);
    setCurrentCardIndex(0); // Reset stack when filters change
  }, [userRole, legalAccepted, filters, myProfile.interestedIn]); 

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    
    // Simulate API delay and state update
    setTimeout(() => {
      if (direction === 'right') {
        const newMatch = cards[currentCardIndex];
        setMatches(prev => [...prev, { ...newMatch, lastMessage: "Matched just now" }]);
      }
      setCurrentCardIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
    setCurrentStep('setup');
  };

  const handleSetupComplete = (data) => {
    setMyProfile({ ...data, type: userRole });
    setCurrentStep('app');
  };

  const handleProfileUpdate = (updatedData) => {
      setMyProfile({ ...myProfile, ...updatedData });
      setView('stack'); 
  };

  // --- Main Render Logic ---

  if (!legalAccepted) return <LegalModal onAccept={() => setLegalAccepted(true)} />;
  if (currentStep === 'welcome') return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
  if (currentStep === 'setup') return <SetupScreen onSave={handleSetupComplete} userRole={userRole} />;

  // App View
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-white h-screen shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Modals */}
        {showFilters && (
          <FilterModal 
            filters={filters} 
            setFilters={setFilters} 
            onClose={() => setShowFilters(false)} 
          />
        )}
        {activeProfileDetails && (
            <ProfileDetailModal 
                profile={activeProfileDetails} 
                onClose={() => setActiveProfileDetails(null)} 
                onSwipe={handleSwipe}
            />
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {view === 'stack' && (
            <div className="absolute inset-0 pb-20 flex flex-col">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center text-white">
                <button 
                    onClick={() => setView('profile')}
                    className="p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="flex items-center font-bold text-xl drop-shadow-md">
                  <span className="mr-1">Connect</span>
                  <Heart className="w-5 h-5 fill-current text-rose-500" />
                </div>
                <button 
                  onClick={() => setShowFilters(true)}
                  className="p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Card Stack */}
              <div className="flex-1 relative w-full h-full bg-gray-100">
                {currentCardIndex >= cards.length ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Heart className="w-10 h-10 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No more profiles</h3>
                    <p className="text-gray-500">Check back later for more people matching your criteria.</p>
                    <div className="flex gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setShowFilters(true)}>
                            Adjust Filters
                        </Button>
                        <Button variant="ghost" onClick={() => setCurrentCardIndex(0)}>
                            Start Over
                        </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Render next card below for depth effect */}
                    {currentCardIndex + 1 < cards.length && (
                      <div className="absolute inset-0 transform scale-95 opacity-50 pointer-events-none">
                         <Card profile={cards[currentCardIndex + 1]} />
                      </div>
                    )}
                    {/* Active Card */}
                    <div className="absolute inset-0 z-10">
                      <Card 
                        profile={cards[currentCardIndex]} 
                        swipeDirection={swipeDirection} 
                        onInfoClick={() => setActiveProfileDetails(cards[currentCardIndex])}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Floating Controls */}
              {currentCardIndex < cards.length && (
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-20">
                  <button 
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 bg-white rounded-full shadow-xl text-red-500 flex items-center justify-center hover:scale-110 transition-all border border-red-100"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => setActiveProfileDetails(cards[currentCardIndex])}
                    className="w-12 h-12 bg-white rounded-full shadow-lg text-blue-400 flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <Info className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-xl text-white flex items-center justify-center hover:scale-110 transition-all hover:shadow-rose-300/50"
                  >
                    <Heart className="w-8 h-8 fill-current" />
                  </button>
                </div>
              )}
            </div>
          )}

          {view === 'matches' && <MatchesList matches={matches} onSelectMatch={(match) => { setActiveChat(match); setView('chat'); }} />}
          {view === 'chat' && activeChat && (
            <ChatScreen 
              match={activeChat} 
              onClose={() => setView('matches')} 
              onViewProfile={() => setActiveProfileDetails(activeChat)} 
            />
          )}
          {view === 'profile' && <SetupScreen initialData={myProfile} onSave={handleProfileUpdate} mode="edit" userRole={userRole} onBack={() => setView('stack')} />}
        </div>

        {/* Bottom Navigation */}
        {view !== 'chat' && view !== 'profile' && (
          <div className="bg-white border-t h-16 flex items-center justify-around z-20 pb-safe">
            <button 
              onClick={() => setView('stack')}
              className={`p-2 rounded-full transition-colors ${view === 'stack' ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Heart className={`w-6 h-6 ${view === 'stack' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setView('matches')}
              className={`p-2 rounded-full transition-colors relative ${view === 'matches' ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MessageCircle className="w-6 h-6" />
              {matches.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>}
            </button>
            <button 
              onClick={() => setView('profile')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
