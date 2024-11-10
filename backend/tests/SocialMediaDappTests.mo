import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Error "mo:base/Error";
import Cycles "mo:base/ExperimentalCycles";
import UserManager "../src/actors/UserManager";
import SocialMediaDapp "../src/actors/SocialMediaDapp";
import Types "../src/actors/Types/lib";

shared({caller = deployer}) actor class SocialMediaTests() = this {
    // Constants for cycle management
    let CANISTER_CREATION_CYCLES = 10_000_000_000_000; // 10T cycles for creation
    let OPERATION_CYCLES = 1_000_000_000_000;  // 1T cycles for operations
    
    // Test data
    let TEST_USER_1 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
    let TEST_USER_2 = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");

    // Variables to store actor instances
    var userManager : ?UserManager.UserManager = null;
    var socialMediaDapp : ?SocialMediaDapp.SocialMediaDapp = null;
    
    // Helper function to create a test profile
    private func createTestProfile(username: Text, id: Principal) : Types.UserProfile {
        {
            id = id;
            username = username;
            bio = ?"Test bio";
            profilePic = null;
            followers = [];
            following = [];
            joinDate = Time.now();
        }
    };

    // Initialize function to set up test environment
    public shared(msg) func initialize() : async () {
        assert(msg.caller == deployer);
        try {
            // Initialize UserManager
            Cycles.add(CANISTER_CREATION_CYCLES);
            let newUserManager = await UserManager.UserManager();
            userManager := ?newUserManager;
            
            // Initialize SocialMediaDapp
            Cycles.add(CANISTER_CREATION_CYCLES);
            let newSocialMediaDapp = await SocialMediaDapp.SocialMediaDapp(Principal.toText(Principal.fromActor(newUserManager)));
            socialMediaDapp := ?newSocialMediaDapp;
            
        } catch (e) {
            Debug.print("Failed to initialize: " # Error.message(e));
            throw e;
        };
    };

    // UserManager Tests
    public shared(msg) func testUserRegistration() : async Bool {
        assert(msg.caller == deployer);
        Debug.print("Running UserManager registration tests...");
        
        switch (userManager) {
            case (null) {
                Debug.print("❌ UserManager not initialized");
                return false;
            };
            case (?manager) {
                try {
                    // Test 1: Valid registration
                    let profile1 = createTestProfile("user1", TEST_USER_1);
                    let result1 = await manager.registerUser(profile1);
                    
                    switch(result1) {
                        case (#ok(profile)) {
                            assert(profile.username == "user1");
                            assert(profile.id == TEST_USER_1);
                            
                            // Test 2: Duplicate registration
                            let dupResult = await manager.registerUser(profile1);
                            switch(dupResult) {
                                case (#err(#AlreadyExists)) {
                                    // Test 3: Invalid username
                                    let invalidProfile = createTestProfile("u", TEST_USER_2);
                                    let invalidResult = await manager.registerUser(invalidProfile);
                                    
                                    switch(invalidResult) {
                                        case (#err(#InvalidInput)) {
                                            Debug.print("✓ User registration tests passed");
                                            return true;
                                        };
                                        case _ {
                                            Debug.print("✗ Invalid username should be rejected");
                                            return false;
                                        };
                                    };
                                };
                                case _ {
                                    Debug.print("✗ Duplicate registration should be rejected");
                                    return false;
                                };
                            };
                        };
                        case _ {
                            Debug.print("✗ Valid registration failed");
                            return false;
                        };
                    };
                } catch (e) {
                    Debug.print("✗ User registration test failed with exception: " # Error.message(e));
                    return false;
                };
            };
        };
    };

    // Post Operations Tests
    public shared(msg) func testPostOperations() : async Bool {
        assert(msg.caller == deployer);
        Debug.print("Running post operations tests...");

        switch (userManager, socialMediaDapp) {
            case (?manager, ?dapp) {
                try {
                    // Setup: Register a test user
                    let profile = createTestProfile("poster", TEST_USER_1);
                    ignore await manager.registerUser(profile);

                    // Test 1: Create Post
                    let createResult = await dapp.createPost("Test post content");
                    switch(createResult) {
                        case (#ok(post)) {
                            assert(post.content == "Test post content");
                            assert(post.author == TEST_USER_1);
                            let postId = post.id;

                            // Test 2: Like Post
                            let likeResult = await dapp.likePost(postId);
                            switch(likeResult) {
                                case (#ok(likedPost)) {
                                    assert(likedPost.likes == 1);
                                    assert(Array.size(likedPost.user_likes) == 1);

                                    // Test 3: Unlike Post
                                    let unlikeResult = await dapp.unlikePost(postId);
                                    switch(unlikeResult) {
                                        case (#ok(unlikedPost)) {
                                            assert(unlikedPost.likes == 0);
                                            assert(Array.size(unlikedPost.user_likes) == 0);

                                            // Test 4: Add Comment
                                            let commentResult = await dapp.addComment(postId, "Test comment");
                                            switch(commentResult) {
                                                case (#ok(commentedPost)) {
                                                    assert(Array.size(commentedPost.comments) == 1);
                                                    assert(commentedPost.comments[0].content == "Test comment");
                                                    
                                                    Debug.print("✓ Post operations tests passed");
                                                    return true;
                                                };
                                                case _ {
                                                    Debug.print("✗ Comment addition failed");
                                                    return false;
                                                };
                                            };
                                        };
                                        case _ {
                                            Debug.print("✗ Unlike operation failed");
                                            return false;
                                        };
                                    };
                                };
                                case _ {
                                    Debug.print("✗ Like operation failed");
                                    return false;
                                };
                            };
                        };
                        case _ {
                            Debug.print("✗ Post creation failed");
                            return false;
                        };
                    };
                } catch (e) {
                    Debug.print("✗ Post operations test failed with exception: " # Error.message(e));
                    return false;
                };
            };
            case _ {
                Debug.print("❌ Actors not initialized");
                return false;
            };
        };
    };

    // Follow Operations Tests
    public shared(msg) func testFollowOperations() : async Bool {
        assert(msg.caller == deployer);
        Debug.print("Running follow operations tests...");

        switch (userManager) {
            case (?manager) {
                try {
                    // Setup: Register test users
                    let profile1 = createTestProfile("follower", TEST_USER_1);
                    let profile2 = createTestProfile("followed", TEST_USER_2);
                    
                    ignore await manager.registerUser(profile1);
                    ignore await manager.registerUser(profile2);

                    // Test 1: Follow User
                    let followResult = await manager.followUser(TEST_USER_2);
                    switch(followResult) {
                        case (#ok(updatedProfile)) {
                            assert(Array.size(updatedProfile.following) == 1);
                            
                            // Test 2: Verify Followed User's Profile
                            let followedProfile = await manager.getProfile(TEST_USER_2);
                            switch(followedProfile) {
                                case (#ok(profile)) {
                                    assert(Array.size(profile.followers) == 1);

                                    // Test 3: Unfollow User
                                    let unfollowResult = await manager.unfollowUser(TEST_USER_2);
                                    switch(unfollowResult) {
                                        case (#ok(finalProfile)) {
                                            assert(Array.size(finalProfile.following) == 0);
                                            
                                            Debug.print("✓ Follow operations tests passed");
                                            return true;
                                        };
                                        case _ {
                                            Debug.print("✗ Unfollow operation failed");
                                            return false;
                                        };
                                    };
                                };
                                case _ {
                                    Debug.print("✗ Failed to verify followed user's profile");
                                    return false;
                                };
                            };
                        };
                        case _ {
                            Debug.print("✗ Follow operation failed");
                            return false;
                        };
                    };
                } catch (e) {
                    Debug.print("✗ Follow operations test failed with exception: " # Error.message(e));
                    return false;
                };
            };
            case null {
                Debug.print("❌ UserManager not initialized");
                return false;
            };
        };
    };

    // Run all tests
    public shared(msg) func runAllTests() : async Bool {
        assert(msg.caller == deployer);
        var allTestsPassed = true;

        // Run user registration tests
        if (not (await testUserRegistration())) {
            allTestsPassed := false;
            Debug.print("❌ User registration tests failed");
        };

        // Run post operations tests
        if (not (await testPostOperations())) {
            allTestsPassed := false;
            Debug.print("❌ Post operations tests failed");
        };

        // Run follow operations tests
        if (not (await testFollowOperations())) {
            allTestsPassed := false;
            Debug.print("❌ Follow operations tests failed");
        };

        if (allTestsPassed) {
            Debug.print("✅ All tests passed successfully!");
        } else {
            Debug.print("❌ Some tests failed!");
        };

        return allTestsPassed;
    };
}