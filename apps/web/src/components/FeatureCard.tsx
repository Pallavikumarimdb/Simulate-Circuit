
import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className, 
  iconClassName 
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "card-neu p-6 flex flex-col items-start text-center items-center justify-center", 
      className
    )}>
      <div className={cn(
        "p-3 rounded-full bg-accent mb-4 text-primary",
        iconClassName
      )}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

export default FeatureCard;
