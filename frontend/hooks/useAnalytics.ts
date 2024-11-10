type EventName =
  | "post_created"
  | "post_liked"
  | "comment_added"
  | "profile_updated"
  | "user_followed"
  | "user_unfollowed"
  | "search_performed";

type EventProperties = Record<string, string | number | boolean>;

export function useAnalytics() {
  const trackEvent = (name: EventName, properties?: EventProperties) => {
    // In a real app, you would integrate with an analytics service
    console.log(`[Analytics] ${name}`, properties);
  };

  return { trackEvent };
}
