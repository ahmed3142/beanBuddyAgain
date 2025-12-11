// app/lib/api.js

// --- DYNAMIC API URL LOGIC ---

// 1. Define both URLs
const PROD_API_URL = 'https://beanbuddyagain.onrender.com/api/v1'; // For Vercel
const DEV_API_URL = 'http://localhost:8081/api/v1'; // For your local machine

// 2. Check which environment we are in
const API_URL = process.env.NODE_ENV === 'production' 
    ? PROD_API_URL   // Use ngrok if on Vercel
    : DEV_API_URL;   // Use localhost if on your machine

// --- END OF DYNAMIC LOGIC ---


/**
 * Fetches data from protected endpoints.
 * Automatically adds Authorization header and ngrok-skip header.
 */
async function fetchProtected(url, token, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
      'ngrok-skip-browser-warning': 'true' // Skip ngrok warning
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); 
    const message = errorData.message || errorData.detail || response.statusText;
    throw new Error(message); 
  }
  
  if (response.status === 204) return null; // Handle 204 No Content
  return response.json();
}

/**
 * Fetches data from public endpoints.
 * Automatically adds ngrok-skip header.
 */
async function fetchPublic(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true' // Skip ngrok warning
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); 
    const message = errorData.message || errorData.detail || response.statusText;
    throw new Error(message); 
  }
  
  return response.json();
}


// --- Public API Functions (No token needed) ---

export const getPublicCourses = () => {
  return fetchPublic('/courses/public/all');
};

export const getPublicProfileByUsername = (username) => {
  return fetchPublic(`/users/public/${username}`);
};

export const getPublicCoursesByUsername = (username) => {
  return fetchPublic(`/courses/public/by/${username}`);
};


// --- Protected API Functions (Token required) ---

export const getCourseDetails = (token, id) => {
  return fetchProtected(`/courses/${id}`, token);
};

export const getMyDashboard = (token) => {
  return fetchProtected('/users/me/dashboard', token);
};

// --- !!! EIKHANE SHOTHIK KORA HOYECHE !!! ---
export const getMyProfile = (token) => {
  // Ashol endpoint-ti CourseController-e ache
  return fetchProtected('/courses/my-profile', token); 
};

export const updateMyProfile = (token, updateData) => {
  return fetchProtected('/users/me', token, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

export const deleteMyAccount = (token) => {
  return fetchProtected('/users/me', token, {
    method: 'DELETE',
  });
};

// --- Enrollment & Payment ---

export const enrollInCourse = (courseId, token) => {
  return fetchProtected(`/enrollments/enroll/${courseId}`, token, {
    method: 'POST',
  });
};

export const checkEnrollmentStatus = (token, courseId) => {
  return fetchProtected(`/enrollments/is-enrolled/${courseId}`, token);
};

export const initiatePayment = (token, courseId) => {
  const requestBody = {
    frontendBaseUrl: window.location.origin 
  };

  return fetchProtected(`/payment/initiate/${courseId}`, token, {
    method: 'POST',
    body: JSON.stringify(requestBody) 
  });
};

// --- Course & Lesson Management ---

export const createCourse = (token, courseData) => {
  return fetchProtected('/courses/create', token, {
    method: 'POST',
    body: JSON.stringify(courseData), 
  });
};

export const addLessonToCourse = (token, courseId, lessonData) => {
  return fetchProtected(`/lessons/course/${courseId}`, token, {
    method: 'POST',
    body: JSON.stringify(lessonData), 
  });
};

export const deleteLesson = (token, lessonId) => {
  return fetchProtected(`/lessons/${lessonId}`, token, {
    method: 'DELETE',
  });
};

export const getLessonDetails = (token, lessonId) => {
  return fetchProtected(`/lessons/${lessonId}`, token);
};

export const markLessonComplete = (token, lessonId) => {
  return fetchProtected(`/lessons/${lessonId}/complete`, token, {
    method: 'POST',
  });
};

// --- Comments ---

export const getCourseComments = (token, courseId) => {
  return fetchProtected(`/courses/${courseId}/comments`, token);
};

export const postCourseComment = (token, courseId, commentData) => {
  return fetchProtected(`/courses/${courseId}/comments`, token, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

export const getLessonComments = (token, lessonId) => {
  return fetchProtected(`/lessons/${lessonId}/comments`, token);
};

export const postLessonComment = (token, lessonId, commentData) => {
  return fetchProtected(`/lessons/${lessonId}/comments`, token, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

// --- Admin ---

export const deleteCourseAsAdmin = (token, courseId) => {
  return fetchProtected(`/admin/courses/${courseId}`, token, {
    method: 'DELETE',
  });
};