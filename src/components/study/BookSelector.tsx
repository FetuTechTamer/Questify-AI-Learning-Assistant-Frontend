import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, Spinner } from "@phosphor-icons/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { materialService, Material } from "@/services/materialService";
import { api } from "@/services/api";
import { toast } from "sonner";

interface BookSelectorProps {
    onSelect: (material: Material) => void;
}

export function BookSelector({ onSelect }: BookSelectorProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const data = await materialService.getMaterials();
                setMaterials(data);
            } catch (error) {
                console.error("Failed to fetch materials:", error);
                toast.error("Failed to load materials");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]">
                <div className="max-w-5xl w-full space-y-8">
                    <div className="text-left space-y-2 border-b pb-6">
                        <h1 className="text-3xl font-black tracking-tight">Library & Resources</h1>
                        <p className="text-muted-foreground">Select a source material to begin your study session.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : materials.length === 0 ? (
                        <Card className="p-12 text-center border-dashed mt-8 max-w-2xl mx-auto w-full">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No materials found</h3>
                            <p className="text-muted-foreground mb-6">Upload some study materials first to begin your study session.</p>
                            <Button asChild>
                                <Link to="/upload">Upload Material</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map((material) => (
                                <button
                                    key={material.id}
                                    onClick={() => onSelect(material)}
                                    className="group relative flex flex-col items-start p-6 border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 text-left"
                                >
                                    <div className="p-3 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {material.title || material.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{material.description}</p>

                                    <div className="mt-auto w-full pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                        <span>Open Material</span>
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
