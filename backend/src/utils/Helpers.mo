import Int "mo:base/Int";
import Text "mo:base/Text";

module {
    // Format timestamp to human readable format
    public func formatTimestamp(timestamp : Int) : Text {
        // Simple implementation - can be expanded based on requirements
        Int.toText(timestamp)
    };
    
    // Validate post content
    public func validatePostContent(content : Text) : Bool {
        let length = Text.size(content);
        length > 0 and length <= 280 // Example: Max 280 characters like Twitter
    };
    
    // Generate a unique hash for content
    public func generateContentHash(content : Text, timestamp : Int) : Text {
        // Simple concatenation - can be replaced with proper hashing
        content # Int.toText(timestamp)
    };
}