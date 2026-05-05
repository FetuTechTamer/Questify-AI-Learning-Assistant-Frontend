import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, Spinner } from "@phosphor-icons/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collectionsService, Collection } from "@/services/collectionsService";
import { useMaterial } from "@/contexts/MaterialContext";
import { toast } from "sonner";

interface CollectionSelectorProps {
    onSelect: (collection: Collection) => void;
}

export function BookSelector({ onSelect }: CollectionSelectorProps) {
    const { collectionId: sessionCollectionId } = useMaterial();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await collectionsService.getCollections();
                setCollections(data);
            } catch (error: any) {
                console.error("--- Collection Fetch Error (BookSelector) ---");
                console.error("URL: /api/collections/");
                
                // Fallback to session collection
                if (sessionCollectionId) {
                    const fallbackCollection: Collection = {
                        collection_id: sessionCollectionId,
                        title: "Current Session Collection",
                        description: "Materials you just uploaded and processed",
                        created_at: new Date().toISOString()
                    };
                    setCollections([fallbackCollection]);
                    toast.info("Using collection from your current session.");
                } else {
                    toast.error("Failed to load study collections");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollections();
    }, [sessionCollectionId]);

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]">
                <div className="max-w-5xl w-full space-y-8">
                    <div className="text-left space-y-2 border-b pb-6">
                        <h1 className="text-3xl font-black tracking-tight">Study Collections</h1>
                        <p className="text-muted-foreground">Select a processed study collection to begin your session.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : collections.length === 0 ? (
                        <Card className="p-12 text-center border-dashed mt-8 max-w-2xl mx-auto w-full">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No collections found</h3>
                            <p className="text-muted-foreground mb-6">Upload some study materials first and process them to begin your study session.</p>
                            <Button asChild>
                                <Link to="/upload">Upload & Process</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {collections.map((collection) => (
                                <button
                                    key={collection.collection_id}
                                    onClick={() => onSelect(collection)}
                                    className="group relative flex flex-col items-start p-6 border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 text-left"
                                >
                                    <div className="p-3 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {collection.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{collection.description}</p>

                                    <div className="mt-auto w-full pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                        <span>Start Studying</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

