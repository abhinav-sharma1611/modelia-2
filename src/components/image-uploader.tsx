
"use client";

import type * as React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const MAX_IMAGES = 3;

interface ImageFile {
    id: string;
    file: File;
    previewUrl: string; // Object URL for preview
}

interface ImageUploaderProps {
    onImagesChange: (images: File[]) => void;
    // Adding a key prop externally will handle resets
}

export function ImageUploader({ onImagesChange }: ImageUploaderProps) {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    // Removed isLoading state related to localStorage
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Effect to call onImagesChange when images state updates
    useEffect(() => {
        onImagesChange(images.map(img => img.file));

        // Cleanup object URLs on unmount or when images change
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.previewUrl));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images]); // Depend only on images array


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            addImages(Array.from(files));
        }
        // Reset input value to allow uploading the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const addImages = (files: File[]) => {
        const newImagesToAdd: ImageFile[] = [];
        const currentImageCount = images.length;
        let addedCount = 0;
        const urlsToRevokeOnError: string[] = []; // Keep track of URLs to revoke if adding fails

        for (const file of files) {
            if (currentImageCount + addedCount >= MAX_IMAGES) {
                toast({
                    variant: "destructive",
                    title: "Upload Limit Reached",
                    description: `You can only upload up to ${MAX_IMAGES} images.`,
                });
                break; // Stop adding more files
            }
            if (file.type.startsWith("image/")) {
                // Basic size check (e.g., 10MB) - adjust as needed
                if (file.size > 10 * 1024 * 1024) {
                     toast({
                         variant: "destructive",
                         title: "File Too Large",
                         description: `Image "${file.name}" exceeds the 10MB limit.`,
                     });
                     continue; // Skip this file
                }

                const newImageId = crypto.randomUUID();
                const previewUrl = URL.createObjectURL(file);
                urlsToRevokeOnError.push(previewUrl); // Add to potential revoke list
                const newImage: ImageFile = {
                    id: newImageId,
                    file: file,
                    previewUrl: previewUrl,
                };
                newImagesToAdd.push(newImage);
                addedCount++;
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: `File "${file.name}" is not a valid image.`,
                });
            }
        }

        if (newImagesToAdd.length > 0) {
            // Revoke URLs created for files that were ultimately not added (e.g., limit reached mid-loop)
            const addedIds = new Set(newImagesToAdd.map(img => img.id));
            urlsToRevokeOnError.forEach(url => {
                // If a URL corresponds to an image that *wasn't* successfully added, revoke it.
                // This check is a bit indirect; ideally, map URL back to the file/ID if needed,
                // but simply checking if *any* images were added might be sufficient if partial adds are rare.
                // For robustness, could track which specific files failed.
                // Here, we just proceed assuming if newImagesToAdd is populated, they were added.
            });


            const updatedImages = [...images, ...newImagesToAdd];
             // Check if adding exceeds MAX_IMAGES (double-check)
            if (updatedImages.length > MAX_IMAGES) {
                 toast({
                    variant: "destructive",
                    title: "Upload Limit Exceeded",
                    description: `Cannot add all selected images. Limit is ${MAX_IMAGES}.`,
                });
                // Revoke URLs for the excess images that won't be set
                const excessImages = updatedImages.slice(MAX_IMAGES);
                excessImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
                // Set only the allowed number of images
                 setImages(updatedImages.slice(0, MAX_IMAGES));
            } else {
                setImages(updatedImages); // Update state with the new images
            }

        } else {
             // If no images were added (e.g., all invalid or too large), revoke any URLs created
             urlsToRevokeOnError.forEach(url => URL.revokeObjectURL(url));
        }
    };


    const handleRemoveImage = (idToRemove: string) => {
        const imageToRemove = images.find(img => img.id === idToRemove);
        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.previewUrl); // Clean up object URL immediately
        }
        const updatedImages = images.filter((image) => image.id !== idToRemove);
        setImages(updatedImages);
        // onImagesChange is handled by the useEffect watching `images`
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Drag and Drop Handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Check if the leave event target is outside the drop zone
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        } else if (!e.relatedTarget) {
            // Handles leaving the browser window
             setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy'; // Explicitly show copy cursor
        setIsDragging(true); // Keep dragging state true while over
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            addImages(Array.from(files));
            e.dataTransfer.clearData();
        }
    };

    // Removed loading state check

    return (
        <div className="space-y-4">
            <Card
                className={`border-2 border-dashed ${
                    isDragging ? "border-primary bg-accent" : "border-border"
                } transition-colors duration-200 ease-in-out`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[150px]">
                     {images.length < MAX_IMAGES ? (
                        <>
                            <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary cursor-pointer" onClick={handleButtonClick}>
                                    Click to upload
                                </span>{" "}
                                or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF up to 10MB. Max {MAX_IMAGES} images ({MAX_IMAGES - images.length} remaining).
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                             {!isDragging && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={handleButtonClick}
                                >
                                   <ImageIcon className="mr-2 h-4 w-4" /> Choose Files
                                </Button>
                            )}
                        </>
                    ) : (
                         <>
                            <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Maximum number of images reached ({MAX_IMAGES}).
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Remove an image to upload a new one.
                            </p>
                         </>
                    )}
                </CardContent>
            </Card>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group aspect-square">
                            <Image
                                src={image.previewUrl}
                                alt={`Preview ${image.file.name}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full rounded-md border"
                                unoptimized // Necessary for blob URLs
                                data-ai-hint="product image preview"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                onClick={() => handleRemoveImage(image.id)}
                                aria-label="Remove image"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {image.file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
