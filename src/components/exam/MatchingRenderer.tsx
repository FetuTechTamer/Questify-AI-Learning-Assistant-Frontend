import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Target } from '@phosphor-icons/react';

interface MatchingRendererProps {
    question: {
        question_id: string;
        question: string;
        content: {
            left_side: string[];
            right_side: string[];
            pairs: Record<string, string>;
        };
    };
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    disabled?: boolean;
}

export const MatchingRenderer: React.FC<MatchingRendererProps> = ({
    question,
    value = {},
    onChange,
    disabled
}) => {
    const { left_side, right_side } = question.content;

    const handleSelectChange = (leftItem: string, rightItem: string) => {
        onChange({
            ...value,
            [leftItem]: rightItem
        });
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-primary font-black text-sm">Q</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-tight pt-1">
                        {question.question}
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 mb-2">
                        <div className="col-span-12 md:col-span-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Concept / Term</span>
                        </div>
                        <div className="hidden md:block md:col-span-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Correct Definition / Match</span>
                        </div>
                    </div>
                    
                    {left_side.map((leftItem, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "grid grid-cols-12 items-center gap-4 p-4 md:p-5 rounded-3xl border transition-all relative group",
                                value[leftItem] 
                                    ? "bg-primary/[0.03] border-primary/40 shadow-sm" 
                                    : "bg-card/40 border-border/50 hover:border-primary/30"
                            )}
                        >
                            <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors",
                                    value[leftItem] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <div className="font-bold text-sm md:text-base text-foreground leading-tight">
                                    {leftItem}
                                </div>
                            </div>
                            
                            <div className="col-span-12 md:col-span-6 relative">
                                <Select
                                    disabled={disabled}
                                    value={value[leftItem] || ""}
                                    onValueChange={(val) => handleSelectChange(leftItem, val)}
                                >
                                    <SelectTrigger className={cn(
                                        "w-full h-11 rounded-xl bg-background/50 border-border/50 font-medium transition-all",
                                        value[leftItem] && "border-primary/50 text-primary font-bold shadow-inner"
                                    )}>
                                        <SelectValue placeholder="Select the matching item..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                                        {right_side.map((rightItem, rIdx) => (
                                            <SelectItem 
                                                key={rIdx} 
                                                value={rightItem}
                                                className="rounded-lg py-3 focus:bg-primary focus:text-primary-foreground"
                                            >
                                                {rightItem}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {value[leftItem] && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-500" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">
                            <Target className="w-4 h-4 text-primary" weight="fill" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matching Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {Object.keys(value).length} / {left_side.length} Linked
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

