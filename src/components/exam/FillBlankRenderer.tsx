import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sparkle } from '@phosphor-icons/react';

interface FillBlankRendererProps {
    question: {
        question_id: string;
        question: string;
        content: {
            sentence: string;
            correct_word: string;
        };
    };
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const FillBlankRenderer: React.FC<FillBlankRendererProps> = ({
    question,
    value,
    onChange,
    disabled
}) => {
    const parts = question.content.sentence.split('_____');

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

                <div className="p-8 rounded-3xl bg-card/40 border border-border/50 leading-[2.5] text-lg md:text-xl font-medium text-foreground/90 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-focus-within:bg-primary transition-colors" />
                    
                    {parts[0]}
                    <div className="inline-block relative">
                        <Input
                            disabled={disabled}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={cn(
                                "inline-block w-48 h-10 mx-2 border-0 border-b-2 rounded-none bg-primary/5 focus-visible:ring-0 px-4 transition-all font-black text-primary text-center placeholder:text-muted-foreground/30 placeholder:font-normal placeholder:italic",
                                value ? "border-primary" : "border-muted-foreground/30"
                            )}
                            placeholder="type missing word"
                        />
                        {value && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in duration-300">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">Answered</Badge>
                            </div>
                        )}
                    </div>
                    {parts[1]}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-4 px-2 italic uppercase tracking-[0.2em] font-bold">
                    <Sparkle className="w-3.5 h-3.5 text-primary animate-pulse" weight="fill" />
                    Context-aware grading enabled
                </div>
            </CardContent>
        </Card>
    );
};

