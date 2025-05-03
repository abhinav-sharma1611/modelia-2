
"use client";

import type * as React from "react";
import { useState } from "react"; // Import useState
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ProductFormSchema } from "@/libs/schemas";
import type { ProductData } from "@/libs/types";

interface ProductFormProps {
    // Ensure onSubmit returns a Promise that can be awaited and potentially reject
    onSubmit: (data: ProductData) => Promise<void>;
}

export function ProductForm({ onSubmit }: ProductFormProps) {
    const { toast } = useToast();
    const [formResetKey, setFormResetKey] = useState(Date.now()); // Use timestamp for unique key
    const form = useForm<z.infer<typeof ProductFormSchema>>({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            title: "",
            category: undefined,
            tags: "",
        },
    });

    const { isSubmitting } = form.formState;

    const handleFormSubmit = async (data: z.infer<typeof ProductFormSchema>) => {
        const productData: ProductData = {
            title: data.title,
            category: data.category,
            tags: data.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
        };

        try {
             // Await the onSubmit promise. It might resolve or reject.
             await onSubmit(productData);

             // If onSubmit resolves, reset the form
             // Success toast is now handled in the parent component (page.tsx)
             form.reset(); // Reset form fields
             setFormResetKey(Date.now()); // Change key to force Select re-render

        } catch (error: any) { // Catch potential rejection from onSubmit
             console.error("Submission failed:", error);
              toast({
                variant: "destructive",
                title: "Submission Failed",
                // Display the error message from the rejected promise
                description: error?.message || "There was an error submitting the product information.",
            });
        }
    };

    return (
        <Form {...form}>
            {/* Pass formResetKey to ensure form re-renders fully on reset */}
            <form key={formResetKey} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Summer Vibes T-Shirt" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of the product.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                             {/* Add key to Select based on formResetKey */}
                            <Select
                                key={`category-select-${formResetKey}`}
                                onValueChange={field.onChange}
                                defaultValue={field.value} // This should be undefined after reset
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        {/* Placeholder should show when value is undefined */}
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="T-shirt">T-shirt</SelectItem>
                                    <SelectItem value="Dress">Dress</SelectItem>
                                    <SelectItem value="Hoodie">Hoodie</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose the product category.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="e.g. summer, cotton, casual"
                                    className="resize-none"
                                    {...field}
                                    value={field.value ?? ""} // Ensure value is never null/undefined for textarea
                                />
                            </FormControl>
                            <FormDescription>
                                Enter comma-separated tags. Optional.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Submit Product Info"
                    )}
                </Button>
            </form>
        </Form>
    );
}
