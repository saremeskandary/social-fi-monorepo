import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./Types/lib";

actor class SocialMediaDapp(USER_MANAGER_CANISTER_ID: Text) {
    type Post = Types.Post;
    type PostId = Types.PostId;
    type Error = Types.Error;
    type PostResult = Types.PostResult;
    type Comment = Types.Comment;

    private stable var nextPostId : PostId = 0;
    private stable var stablePosts : [(PostId, Post)] = [];

    private func natHash(n: Nat): Hash.Hash {
        Text.hash(Nat.toText(n))
    };
    
    private var posts = HashMap.HashMap<PostId, Post>(0, Nat.equal, natHash);

    private let userManagerActor : actor {
        validateUser : (userId: Principal) -> async Bool;
    } = actor(USER_MANAGER_CANISTER_ID);

    // Helper function to check if a principal has liked a post
    private func hasUserLikedPost(post: Post, user: Principal) : Bool {
        Option.isSome(Array.find<Principal>(post.user_likes, func(p) { p == user }))
    };

    // Create a new post
    public shared({ caller }) func createPost(content : Text) : async PostResult {
        // First validate that user exists and has username
        try {
            let isValidUser = await userManagerActor.validateUser(caller);
            if (not isValidUser) {
                return #err(#NotRegistered);
            };
        } catch _ {
            return #err(#SystemError);
        };

        if (Text.size(content) == 0) {
            return #err(#InvalidInput);
        };

        let post : Post = {
            id = nextPostId;
            content = content;
            author = caller;
            timestamp = Time.now();
            likes = 0;
            user_likes = [];
            comments = [];
        };

        posts.put(nextPostId, post);
        nextPostId += 1;
        #ok(post)
    };

    public query func getPost(postId : PostId) : async PostResult {
        switch (posts.get(postId)) {
            case null { #err(#NotFound) };
            case (?post) { #ok(post) };
        }
    };

    public query func getAllPosts() : async [Post] {
        Iter.toArray(posts.vals())
    };

    public shared({ caller }) func likePost(postId : PostId) : async PostResult {
        // Validate user registration
        try {
            let isValidUser = await userManagerActor.validateUser(caller);
            if (not isValidUser) {
                return #err(#NotRegistered);
            };
        } catch _ {
            return #err(#SystemError);
        };

        switch (posts.get(postId)) {
            case null { #err(#NotFound) };
            case (?post) {
                if (hasUserLikedPost(post, caller)) {
                    return #err(#AlreadyLiked);
                };

                let updatedPost = {
                    id = post.id;
                    content = post.content;
                    author = post.author;
                    timestamp = post.timestamp;
                    likes = post.likes + 1;
                    user_likes = Array.append(post.user_likes, [caller]);
                    comments = post.comments;
                };

                posts.put(postId, updatedPost);
                #ok(updatedPost)
            };
        }
    };

    public shared({ caller }) func unlikePost(postId : PostId) : async PostResult {
        // Validate user registration
        try {
            let isValidUser = await userManagerActor.validateUser(caller);
            if (not isValidUser) {
                return #err(#NotRegistered);
            };
        } catch _ {
            return #err(#SystemError);
        };

        switch (posts.get(postId)) {
            case null { #err(#NotFound) };
            case (?post) {
                if (not hasUserLikedPost(post, caller)) {
                    return #err(#NotLiked);
                };

            let updatedPost = {
                id = post.id;
                content = post.content;
                author = post.author;
                timestamp = post.timestamp;
                likes = Nat.sub(post.likes, 1);  // This will return 0 if post.likes is 0
                user_likes = Array.filter<Principal>(post.user_likes, func(p) { p != caller });
                comments = post.comments;
            };

                posts.put(postId, updatedPost);
                #ok(updatedPost)
            };
        }
    };

    public shared({ caller }) func addComment(postId : PostId, content : Text) : async PostResult {
        // Validate user registration
        try {
            let isValidUser = await userManagerActor.validateUser(caller);
            if (not isValidUser) {
                return #err(#NotRegistered);
            };
        } catch _ {
            return #err(#SystemError);
        };

        if (Text.size(content) == 0) {
            return #err(#InvalidInput);
        };

        switch (posts.get(postId)) {
            case null { #err(#NotFound) };
            case (?post) {
                let comment : Comment = {
                    author = caller;
                    content = content;
                    timestamp = Time.now();
                };

                let updatedPost = {
                    id = post.id;
                    content = post.content;
                    author = post.author;
                    timestamp = post.timestamp;
                    likes = post.likes;
                    user_likes = post.user_likes;
                    comments = Array.append(post.comments, [comment]);
                };

                posts.put(postId, updatedPost);
                #ok(updatedPost)
            };
        }
    };

    // Add method to get posts by user
    public query func getPostsByUser(userId: Principal) : async [Post] {
        let userPosts = Buffer.Buffer<Post>(0);
        for ((_, post) in posts.entries()) {
            if (post.author == userId) {
                userPosts.add(post);
            };
        };
        Buffer.toArray(userPosts)
    };

    // Add method to get feed posts (posts from followed users)
    public shared({ caller }) func getFeedPosts() : async [Post] {
        try {
            let isValidUser = await userManagerActor.validateUser(caller);
            if (not isValidUser) {
                return [];
            };
        } catch _ {
            return [];
        };

        Iter.toArray(posts.vals())
    };

    system func preupgrade() {
        stablePosts := Iter.toArray(posts.entries());
    };

    // Then use it in postupgrade
    system func postupgrade() {
        posts := HashMap.fromIter<PostId, Post>(
            stablePosts.vals(),
            0,
            Nat.equal,
            natHash  // Use our custom hash function instead of Hash.hash
        );
        stablePosts := [];
    };
}