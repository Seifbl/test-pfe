// Define all application routes in a centralized location
export const routes = {
  // Public routes
  home: "/",
  login: "/login",
  signup: "/signup",
  about: "/about",

  // Talent (freelancer) routes
  talent: {
    dashboard: "/talent/dashboard",
    profile: "/talent/profile",
    jobs: "/talent/jobs",
    jobDetail: (id: string) => `/talent/jobs/${id}`,
    messages: "/talent/messages",
    notifications: "/talent/notifications",
    settings: "/talent/settings",
    onboarding: "/talent/onboarding",
  },

  // Company routes
  company: {
    dashboard: "/company/dashboard",
    profile: "/company/profile",
    createJob: "/company/jobs/create",
    jobs: "/company/jobs",
    jobDetail: (id: string) => `/company/jobs/${id}`,
    candidates: "/company/candidates",
    messages: "/company/messages",
    settings: "/company/settings",
  },
}
