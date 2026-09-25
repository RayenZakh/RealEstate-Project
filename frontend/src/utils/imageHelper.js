// Placeholder SVG data URI for properties without images
export const DEFAULT_PLACEHOLDER_IMAGE =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23EDE7DA'/%3E%3Cg fill='%23B5A994'%3E%3Cpath d='M300 130 L190 220 L220 220 L220 280 L280 280 L280 230 L320 230 L320 280 L380 280 L380 220 L410 220 Z'/%3E%3Ctext x='300' y='320' font-family='Arial, sans-serif' font-size='16' text-anchor='middle' fill='%238B7E68'%3ENo image available%3C/text%3E%3C/g%3E%3C/svg%3E";

/**
 * Resolves a stored image path into a full, displayable URL.
 * Handles external URLs, local /uploads paths, and fallbacks.
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") {
        return DEFAULT_PLACEHOLDER_IMAGE;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
        return imagePath;
    }

    const backendUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000";

    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendUrl}${cleanPath}`;
};
