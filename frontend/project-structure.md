# Next.js Frontend - Decentralized Social Media Platform

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── feed/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── edit/
│   │   │       └── page.tsx
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── dfx/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── NavBar.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostForm.tsx
│   │   ├── PostList.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentList.tsx
│   └── profile/
│       ├── ProfileHeader.tsx
│       ├── ProfileStats.tsx
│       ├── FollowersList.tsx
│       └── ProfileEdit.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useProfile.ts
│   └── useInteractions.ts
├── lib/
│   ├── dfx/
│   │   ├── declarations/
│   │   │   ├── social_media_dapp/
│   │   │   └── user_manager/
│   │   └── index.ts
│   ├── constants.ts
│   ├── types.ts
│   └── utils.ts
├── providers/
│   ├── AuthProvider.tsx
│   └── DFXProvider.tsx
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── postSlice.ts
│   │   └── profileSlice.ts
│   └── index.ts
├── styles/
│   └── theme.ts
├── .env
├── .env.local
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Directory Structure Explanation

### 1. `app/` Directory

The main application directory using Next.js 13+ app router structure.

```typescript
// app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to Decentralized Social Media</h1>
    </main>
  );
}
```

#### Route Groups

- `(auth)`: Authentication-related pages
- `(main)`: Main application pages
- Each group has its own layout for consistent styling

### 2. `components/` Directory

Reusable UI components organized by feature.

```typescript
// components/posts/PostCard.tsx
interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, comment: string) => void;
}

export const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={post.author.profilePic} />
        <h3>{post.author.username}</h3>
      </div>
      <p className="mt-3">{post.content}</p>
      {/* Like and Comment actions */}
    </div>
  );
};
```

### 3. `hooks/` Directory

Custom React hooks for business logic and state management.

```typescript
// hooks/usePosts.ts
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const socialMediaActor = await getSocialMediaActor();
      const result = await socialMediaActor.getAllPosts();
      setPosts(result);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, fetchPosts };
}
```

### 4. `lib/` Directory

Utility functions, constants, and type definitions.

```typescript
// lib/dfx/index.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as socialMediaIdl } from "./declarations/social_media_dapp";
import { idlFactory as userManagerIdl } from "./declarations/user_manager";

export async function getSocialMediaActor() {
  const agent = new HttpAgent({ host: process.env.NEXT_PUBLIC_IC_HOST });
  return Actor.createActor(socialMediaIdl, {
    agent,
    canisterId: process.env.NEXT_PUBLIC_SOCIAL_MEDIA_CANISTER_ID,
  });
}
```

### 5. `providers/` Directory

React context providers for global state and services.

```typescript
// providers/DFXProvider.tsx
export const DFXProvider = ({ children }: { children: React.ReactNode }) => {
  const [actor, setActor] = useState<any>(null);

  useEffect(() => {
    const initActor = async () => {
      const socialMediaActor = await getSocialMediaActor();
      setActor(socialMediaActor);
    };
    initActor();
  }, []);

  return (
    <DFXContext.Provider value={{ actor }}>{children}</DFXContext.Provider>
  );
};
```

### 6. `store/` Directory

Redux/RTK store configuration and slices.

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});
```

## Key Features Implementation

### 1. Authentication Flow

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = async (principal: Principal) => {
    try {
      const userManager = await getUserManagerActor();
      const result = await userManager.getProfile(principal);
      if (result.ok) {
        dispatch(setUser(result.ok));
        navigate("/feed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return { login };
}
```

### 2. Post Creation and Interaction

```typescript
// components/posts/PostForm.tsx
export const PostForm = () => {
  const [content, setContent] = useState("");
  const { createPost } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost(content);
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-lg border p-2"
        placeholder="What's on your mind?"
      />
      <button type="submit">Post</button>
    </form>
  );
};
```

### 3. Profile Management

```typescript
// components/profile/ProfileHeader.tsx
export const ProfileHeader = ({ userId }: { userId: string }) => {
  const { profile, loading } = useProfile(userId);
  const { follow, unfollow } = useInteractions();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar size="large" src={profile.profilePic} />
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      <div className="flex gap-4">
        <button onClick={() => follow(userId)}>Follow</button>
        <button onClick={() => unfollow(userId)}>Unfollow</button>
      </div>
    </div>
  );
};
```

## Configuration Files

### 1. `tailwind.config.js`

```javascript
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6B7280",
      },
    },
  },
  plugins: [],
};
```

### 2. Environment Variables

```plaintext
# .env.local
NEXT_PUBLIC_IC_HOST=http://localhost:4943
NEXT_PUBLIC_SOCIAL_MEDIA_CANISTER_ID=xxx
NEXT_PUBLIC_USER_MANAGER_CANISTER_ID=xxx
```

## Setup Instructions

1. Install dependencies:

```bash
pnpm install
```

2. Generate DFX declarations:

```bash
dfx generate
```

3. Start the development server:

```bash
pnpm run dev
```

## Development Guidelines

1. **Component Organization**

   - Use feature-based organization
   - Keep components small and focused
   - Implement proper TypeScript types

2. **State Management**

   - Use Redux for global state
   - Use React Query for server state
   - Implement proper error handling

3. **Styling**

   - Use Tailwind CSS for styling
   - Maintain consistent design system
   - Implement responsive design

4. **Testing**
   - Write unit tests for components
   - Implement integration tests
   - Use proper mocking for IC calls

This structure provides a solid foundation for building a scalable and maintainable frontend for your decentralized social media platform. Would you like me to elaborate on any specific part or provide more implementation details for certain features?
