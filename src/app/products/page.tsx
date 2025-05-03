
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/context/ProductContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

// Helper to create object URLs for images (must be memoized or managed carefully)
const ImagePreview = ({ file }: { file: File }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Cleanup function to revoke the object URL
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file]); // Re-run effect if file changes

    if (!previewUrl) {
        return <div className="aspect-square w-full bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Loading...</div>; // Placeholder or loader
    }

    return (
        <Image
            src={previewUrl}
            alt={`Preview ${file.name}`}
            width={150}
            height={150}
            className="object-cover w-full h-full rounded-md border"
            unoptimized // Necessary for blob URLs
            data-ai-hint="product image"
        />
    );
};


export default function ProductsPage() {
    const { products } = useProducts();

    return (
        <main className="container mx-auto mt-16 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Products List</h1>
                <Link href="/" passHref>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add New Product
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="text-center py-10">
                    <CardHeader>
                        <CardTitle>No Products Yet</CardTitle>
                        <CardDescription>
                            Looks like you haven't added any products. Go ahead and add your first one!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/" passHref>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                        <Card key={index} className="overflow-hidden shadow-lg rounded-lg flex flex-col">
                            <CardHeader className="bg-card">
                                <CardTitle className="text-xl font-semibold text-foreground">{product.title}</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Category: <Badge variant="secondary">{product.category}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow p-4">
                                {product.tags.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium mb-1 text-muted-foreground">Tags:</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {product.tags.map((tag, tagIndex) => (
                                                <Badge key={tagIndex} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.images.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Images:</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {product.images.map((imageFile, imgIndex) => (
                                                <div key={imgIndex} className="relative aspect-square">
                                                    <ImagePreview file={imageFile} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
