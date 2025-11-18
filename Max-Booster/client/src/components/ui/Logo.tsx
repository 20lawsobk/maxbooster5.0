import blawzLogo from '@assets/B-Lawz Music.png_1753050127860_1759355918465.jpeg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TODO: Add function documentation
 */
export function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center space-x-2">
      <img
        src={blawzLogo}
        alt="B-Lawz Music"
        className={`${sizes[size]} object-contain rounded-md`}
      />
      <span className="font-bold text-xl">Max Booster</span>
    </div>
  );
}
