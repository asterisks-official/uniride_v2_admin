import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/** Photo when there is one, initials on a brand-tinted circle otherwise. */
export function UserAvatar({ name, image, size = 'default', className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn(className)}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback className="bg-primary-wash font-semibold text-primary">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
