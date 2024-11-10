import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./Types/lib";
import Char "mo:base/Char";

actor class UserManager() {
    type UserProfile = Types.UserProfile;
    type UserId = Types.UserId;
    type Result<Ok, Err> = Types.Result<Ok, Err>;
    type Error = Types.Error;
    type UserResult = Types.UserResult;
    type UserProfilesResult = Types.UserProfilesResult;
    
    // Stable storage
    private stable var stableUsers : [(UserId, UserProfile)] = [];
    private stable var stableUsernames : [(Text, UserId)] = [];

    // In-memory storage
    private var users = HashMap.HashMap<UserId, UserProfile>(0, Principal.equal, Principal.hash);
    private var usernames = HashMap.HashMap<Text, UserId>(0, Text.equal, Text.hash);
    
    // Username validation helpers
    private func isValidUsername(username: Text) : Bool {
        let length = Text.size(username);
        if (length < 3 or length > 20) {
            return false;
        };
        
        for (char in Text.toIter(username)) {
            if (not isValidUsernameChar(char)) {
                return false;
            };
        };
        true
    };
    
    private func isValidUsernameChar(char: Char) : Bool {
        let c = Char.toNat32(char);
        let isUppercase = c >= 65 and c <= 90;  // A-Z
        let isLowercase = c >= 97 and c <= 122; // a-z
        let isNumber = c >= 48 and c <= 57;     // 0-9
        let isUnderscore = c == 95;             // _
        
        isUppercase or isLowercase or isNumber or isUnderscore
    };
    
    private func isUsernameTaken(username: Text) : Bool {
        Option.isSome(usernames.get(username))
    };

    // Public methods
    public shared query func validateUser(userId: UserId) : async Bool {
        Option.isSome(users.get(userId))
    };

    public shared({ caller }) func registerUser(profile: UserProfile) : async UserResult {
        if (caller != profile.id) {
            return #err(#NotAuthorized);
        };
        
        switch (users.get(caller)) {
            case (?_) { return #err(#AlreadyExists) };
            case null {
                if (isUsernameTaken(profile.username)) {
                    return #err(#UsernameTaken);
                };

                if (not isValidUsername(profile.username)) {
                    return #err(#InvalidInput);
                };
                
                let newProfile: UserProfile = {
                    id = caller;
                    username = profile.username;
                    bio = profile.bio;
                    profilePic = profile.profilePic;
                    followers = [];
                    following = [];
                    joinDate = Time.now();
                };
                
                users.put(caller, newProfile);
                usernames.put(profile.username, caller);
                #ok(newProfile)
            };
        }
    };

    public shared({ caller }) func updateProfile(username: Text, bio: ?Text, profilePic: ?Text) : async UserResult {
        switch (users.get(caller)) {
            case null { #err(#NotFound) };
            case (?existingProfile) {
                if (username != existingProfile.username) {
                    if (isUsernameTaken(username)) {
                        return #err(#UsernameTaken);
                    };
                    
                    if (not isValidUsername(username)) {
                        return #err(#InvalidInput);
                    };

                    usernames.delete(existingProfile.username);
                    usernames.put(username, caller);
                };

                let updatedProfile = {
                    id = caller;
                    username = username;
                    bio = bio;
                    profilePic = profilePic;
                    followers = existingProfile.followers;
                    following = existingProfile.following;
                    joinDate = existingProfile.joinDate;
                };
                
                users.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    public shared({ caller }) func followUser(userToFollow: UserId) : async UserResult {
        if (caller == userToFollow) {
            return #err(#InvalidInput);
        };

        switch (users.get(caller), users.get(userToFollow)) {
            case (null, _) { #err(#NotRegistered) };
            case (_, null) { #err(#NotFound) };
            case (?follower, ?followed) {
                if (Option.isSome(Array.find<UserId>(follower.following, func(id) { id == userToFollow }))) {
                    return #err(#AlreadyExists);
                };

                let updatedFollower = {
                    id = follower.id;
                    username = follower.username;
                    bio = follower.bio;
                    profilePic = follower.profilePic;
                    followers = follower.followers;
                    following = Array.append(follower.following, [userToFollow]);
                    joinDate = follower.joinDate;
                };

                let updatedFollowed = {
                    id = followed.id;
                    username = followed.username;
                    bio = followed.bio;
                    profilePic = followed.profilePic;
                    followers = Array.append(followed.followers, [caller]);
                    following = followed.following;
                    joinDate = followed.joinDate;
                };

                users.put(caller, updatedFollower);
                users.put(userToFollow, updatedFollowed);
                #ok(updatedFollower)
            };
        }
    };

    public shared({ caller }) func unfollowUser(userToUnfollow: UserId) : async UserResult {
        switch (users.get(caller), users.get(userToUnfollow)) {
            case (null, _) { #err(#NotRegistered) };
            case (_, null) { #err(#NotFound) };
            case (?follower, ?followed) {
                switch (Array.find<UserId>(follower.following, func(id) { id == userToUnfollow })) {
                    case null { #err(#NotFound) };
                    case (?_) {
                        let updatedFollower = {
                            id = follower.id;
                            username = follower.username;
                            bio = follower.bio;
                            profilePic = follower.profilePic;
                            followers = follower.followers;
                            following = Array.filter(follower.following, func(id: UserId) : Bool { id != userToUnfollow });
                            joinDate = follower.joinDate;
                        };

                        let updatedFollowed = {
                            id = followed.id;
                            username = followed.username;
                            bio = followed.bio;
                            profilePic = followed.profilePic;
                            followers = Array.filter(followed.followers, func(id: UserId) : Bool { id != caller });
                            following = followed.following;
                            joinDate = followed.joinDate;
                        };

                        users.put(caller, updatedFollower);
                        users.put(userToUnfollow, updatedFollowed);
                        #ok(updatedFollower)
                    };
                };
            };
        }
    };

    public query func getProfile(userId: UserId) : async UserResult {
        switch (users.get(userId)) {
            case null { #err(#NotFound) };
            case (?profile) { #ok(profile) };
        }
    };

    public query func getFollowers(userId: UserId) : async UserProfilesResult {
        switch (users.get(userId)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let followerProfiles = Buffer.Buffer<UserProfile>(0);
                for (followerId in profile.followers.vals()) {
                    switch (users.get(followerId)) {
                        case (?followerProfile) {
                            followerProfiles.add(followerProfile);
                        };
                        case null {};
                    };
                };
                #ok(Buffer.toArray(followerProfiles))
            };
        }
    };

    public query func getFollowing(userId: UserId) : async UserProfilesResult {
        switch (users.get(userId)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let followingProfiles = Buffer.Buffer<UserProfile>(0);
                for (followingId in profile.following.vals()) {
                    switch (users.get(followingId)) {
                        case (?followingProfile) {
                            followingProfiles.add(followingProfile);
                        };
                        case null {};
                    };
                };
                #ok(Buffer.toArray(followingProfiles))
            };
        }
    };

    public query func searchUsers(searchQuery: Text) : async [UserProfile] {
            let results = Buffer.Buffer<UserProfile>(0);
            let queryLower = Text.toLowercase(searchQuery);
            
            for ((username, userId) in usernames.entries()) {
                let usernameLower = Text.toLowercase(username);
                if (Text.size(queryLower) == 0 or Text.contains(usernameLower, #text queryLower)) {
                    switch (users.get(userId)) {
                        case (?profile) { results.add(profile); };
                        case null {};
                    };
                };
            };
            
            Buffer.toArray(results)
    };

    system func preupgrade() {
        stableUsers := Iter.toArray(users.entries());
        stableUsernames := Iter.toArray(usernames.entries());
    };

    system func postupgrade() {
        users := HashMap.fromIter<UserId, UserProfile>(
            stableUsers.vals(),
            0,
            Principal.equal,
            Principal.hash
        );
        usernames := HashMap.fromIter<Text, UserId>(
            stableUsernames.vals(),
            0,
            Text.equal,
            Text.hash
        );
        stableUsers := [];
        stableUsernames := [];
    };
}