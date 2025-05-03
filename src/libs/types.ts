// Define the structure for the product data after processing
export interface ProductData {
    title: string;
    category: "T-shirt" | "Dress" | "Hoodie";
    tags: string[]; // Tags processed into an array of strings
}

// Define the structure for the full submission including images
export interface ProductSubmission extends ProductData {
    images: File[]; // Array of File objects
}

// You can define other types here as needed
