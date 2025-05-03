
'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button'; // Import Button for the navigation link
import { ProductForm } from "@/components/product-form";
import { ImageUploader } from "@/components/image-uploader";
import type { ProductData, ProductSubmission } from "@/libs/types";
import { useProducts } from '@/context/ProductContext'; // Import useProducts hook
import { Plus } from 'lucide-react'; // Import Plus icon
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function Home() {
  const { addProduct } = useProducts(); // Use the context hook
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUploaderKey, setImageUploaderKey] = useState(0); // Key for resetting ImageUploader
  const router = useRouter(); // Get router instance
  const { toast } = useToast(); // Get toast function

  // Callback for ImageUploader to update the parent's state
  const handleImagesChange = (images: File[]) => {
    setUploadedImages(images);
  };

  // Callback for ProductForm submission
  const handleProductSubmit = async (productData: ProductData): Promise<void> => { // Make return type void, handle success/error inside
    return new Promise(async (resolve, reject) => { // Make the promise callback async
        if (uploadedImages.length === 0) {
            // Use reject for errors to be caught by the form
            reject(new Error("Please upload at least one image."));
            return;
        }

        const submissionData: ProductSubmission = {
          ...productData,
          images: uploadedImages, // Use the images from the state
        };

        try {
            addProduct(submissionData); // Add product to context
            console.log("Form Submitted:", submissionData);

             // Show success toast (moved from ProductForm)
             toast({
                 title: "Success!",
                 description: "Product information submitted successfully.",
             });


            // Reset image uploader state by changing its key
            setUploadedImages([]); // Clear local image state
            setImageUploaderKey(prevKey => prevKey + 1); // Increment key

            // Resolve the promise on success before navigation
            resolve();

            // Redirect to products page after a short delay to allow toast visibility
            // Using setTimeout isn't ideal, but simple for this case.
            // A better approach might involve managing toast visibility state.
            await new Promise(res => setTimeout(res, 1500)); // Wait 1.5 seconds
            router.push('/products'); // Navigate to products page

        } catch (error) {
             console.error("Submission failed:", error);
             // Reject the promise on error
             reject(error instanceof Error ? error : new Error("An unknown error occurred during submission."));
        }
    });
  };


  return (
    <main className="container mx-auto p-4 mt-16 sm:p-6 lg:p-8">
       <Card className="max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
         <CardHeader className="bg-card flex flex-row items-center justify-between"> {/* Flex layout for title and button */}
           <div>
             <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground"> {/* Removed text-center */}
               Product Asset Uploader
             </CardTitle>
             <CardDescription className="text-muted-foreground mt-1"> {/* Removed text-center */}
               Fill in the product details and upload images.
             </CardDescription>
            </div>
             <Link href="/products" passHref>
              <Button variant="outline">
                View Products
              </Button>
             </Link>
         </CardHeader>
         <CardContent className="p-6 md:p-8"> {/* Added padding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"> {/* Increased gap */}
                {/* Left Column: Form */}
                <div className="space-y-6">
                     <h2 className="text-xl font-semibold border-b pb-3 text-foreground">Product Information</h2> {/* Adjusted size and spacing */}
                    <ProductForm onSubmit={handleProductSubmit} />
                </div>

                 {/* Right Column: Image Uploader */}
                 <div className="space-y-6">
                     <h2 className="text-xl font-semibold border-b pb-3 text-foreground">Product Images</h2> {/* Adjusted size and spacing */}
                     {/* Pass the key to ImageUploader */}
                     <ImageUploader key={imageUploaderKey} onImagesChange={handleImagesChange} />
                </div>
            </div>
         </CardContent>
       </Card>
    </main>
  );
}
