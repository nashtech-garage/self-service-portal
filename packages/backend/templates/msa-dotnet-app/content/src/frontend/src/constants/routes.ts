export const ROUTES = {
  HOME: {
    path: "/",
    title: "Home",
    parent: null,
  },
  LOGIN: {
    path: "/login",
    title: "Online Asset Management System",
    parent: null,
  },
  USERS: {
    path: "/users",
    title: "Manage User",
    parent: null,
  },
  ASSETS: {
    path: "/asset-management",
    title: "Manage Asset",
    parent: null,
  },
  CREATE_ASSETS: {
    path: "/asset-management/create",
    title: "Create Asset",
    parent: "ASSETS",
  },
  EDIT_ASSETS: {
    path: "/asset-management/edit/:id",
    title: "Edit Asset",
    parent: "ASSETS",
  },
  PROFILE: {
    path: "/profile",
    title: "User Profile",
    parent: null,
  },
  STYLE_GUIDE: {
    path: "/style-guide",
    title: "Style Guide",
    parent: null,
  },
  ERROR_TEST: {
    path: "/error-test",
    title: "Error Testing",
    parent: null,
  },
  ASSIGNMENTS: {
    path: "/assignments",
    title: "Manage Assignments",
    tabletitle: "All Assignments",
    parent: null,
  },
  MY_ASSIGNMENTS: {
    path: "/my-assignments",
    title: "Manage Assignments",
    tabletitle: "My Assignments",
    parent: null,
  },
  CREATE_USER: {
    path: "/users/create",
    title: "Create User",
    parent: "USERS",
  },
  EDIT_USER: {
    path: "/users/edit/:id",
    title: "Edit User",
    parent: "USERS",
  },
  RETURNING_REQUESTS: {
    path: "/return-requests",
    title: "Request for Returning",
    tabletitle: "Request List",
    parent: null,
  },
  REPORT: {
    path: "/report",
    title: "Report",
    parent: null,
  },
  CREATE_ASSIGNMENT: {
    path: "/assignments/create",
    title: "Create Assignment",
    parent: "ASSIGNMENTS",
  },
  EDIT_ASSIGNMENT: {
    path: "/assignments/edit/:assignmentId",
    title: "Edit Assignment",
    parent: "ASSIGNMENTS",
  },
  TEMPLATE: {
    path: "/template",
    title: "Template",
    parent: null,
  },
};

// Export routes by user type
export const ADMIN_ROUTES = ["HOME", "USERS", "ASSETS", "ASSIGNMENTS", "RETURNING_REQUESTS", "REPORT"];

export const STAFF_ROUTES = ["HOME"];
