module {
    public type UserId = Principal;
    
    public type UserProfile = {
        id: UserId;
        username: Text;
        bio: ?Text;
        profilePic: ?Text;
        followers: [UserId];
        following: [UserId];
        joinDate: Int;
    };
    
    public type PostId = Nat;
    
    public type Post = {
        id: PostId;
        content: Text;
        author: Principal;
        timestamp: Int;
        likes: Nat;
        comments: [Comment];
    };
    
    public type Comment = {
        author: Principal;
        content: Text;
        timestamp: Int;
    };
    
    public type CreatePostRequest = {
        content: Text;
    };
    
    public type Result<Ok, Err> = {
        #ok: Ok;
        #err: Err;
    };
    
    public type Error = {
        #NotFound;
        #NotAuthorized;
        #InvalidUsername;
        #InvalidInput;
        #AlreadyExists;
        #UsernameTaken;
        #NotRegistered;
        #SystemError;
    };
}