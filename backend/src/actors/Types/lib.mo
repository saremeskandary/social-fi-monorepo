import Principal "mo:base/Principal";

module {
    public type PostId = Nat;
    public type UserId = Principal;
    
    public type Comment = {
        author: UserId;
        content: Text;
        timestamp: Int;
    };

    public type Post = {
        id: PostId;
        content: Text;
        author: UserId;
        timestamp: Int;
        likes: Nat;
        user_likes: [UserId];
        comments: [Comment];
    };

    public type UserProfile = {
        id: UserId;
        username: Text;
        bio: ?Text;
        profilePic: ?Text;
        followers: [UserId];
        following: [UserId];
        joinDate: Int;
    };

    public type Error = {
        #NotFound;
        #NotAuthorized;
        #InvalidInput;
        #AlreadyExists;
        #UsernameTaken;
        #NotRegistered;
        #SystemError;
        #AlreadyLiked;
        #NotLiked;
    };

    public type Result<Ok, Err> = {
        #ok : Ok;
        #err : Err;
    };

    public type PostResult = Result<Post, Error>;
    public type UserResult = Result<UserProfile, Error>;
    public type UserProfilesResult = Result<[UserProfile], Error>;
}